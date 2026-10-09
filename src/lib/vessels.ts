import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import type { Vessel } from "../data/vessels";

/**
 * The static catalogue, loaded only when the seed needs it.
 *
 * This is a dynamic import so the hard-coded fallback rows stay OUT of the
 * main bundle: without it every public visitor would download a duplicate copy
 * of all 84 listings even though Firestore serves the real data.
 */
const staticVessels = () => import("../data/vessels").then((m) => m.vessels);

/**
 * Vessel data access for Firestore.
 *
 * Document ID is the listing's public id (`v-1000`), preserving every existing
 * `/vessels/:id` link from the old static data file.
 *
 * NOTE: every public query MUST filter on `published == true`. Firestore
 * security rules reject unfiltered list queries, which is what prevents drafts
 * leaking to anonymous visitors.
 */

export type { Vessel };

/**
 * A listing as the admin dashboard sees it: the public `Vessel` plus the
 * Firestore-only `published` flag.
 */
export type AdminVessel = Vessel & { published: boolean };

export type VesselDoc = Omit<Vessel, "id"> & {
  published: boolean;
  /** Legacy name for `agmId`; still present on pre-rename documents. */
  wbsId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const COLLECTION = "vessels";

/**
 * Resolves a listing's AGM/Listing ID so it is never blank.
 *
 * The reference was renamed `wbsId` → `agmId` in the UI redesign, but
 * documents seeded before the rename only carry `wbsId`, and documents can be
 * saved with an empty value. Every read AND write goes through here:
 *
 *  1. a non-blank `agmId` (what admins edit in the dashboard), else
 *  2. `AGM <n>` derived from the `v-<n>` document id, else
 *  3. the legacy `wbsId`, else
 *  4. the raw document id.
 */
function resolveAgmId(
  data: { readonly agmId?: unknown; readonly wbsId?: unknown },
  docId: string,
): string {
  const current = typeof data.agmId === "string" ? data.agmId.trim() : "";
  if (current) return current;
  const suffix = docId.replace(/^v-/, "");
  if (/^\d+$/.test(suffix)) return `AGM ${suffix}`;
  const legacy = typeof data.wbsId === "string" ? data.wbsId.trim() : "";
  if (legacy) return legacy;
  return docId;
}

/**
 * Strips the public `id` (it becomes the document id) for a clean write, and
 * guarantees a listing ID: `agmId` is always written, and `wbsId` is written
 * as a mirror of it because the currently DEPLOYED security rules still
 * validate `wbsId` (see `firestore.rules`). After the rules are redeployed
 * with `firebase deploy --only firestore` the mirror is harmless and can be
 * dropped — until then it is what keeps "Add vessel" and re-seeds passing
 * rules.
 */
function toDoc(vessel: Vessel) {
  const { id, ...rest } = vessel;
  const agmId = resolveAgmId(rest, id);
  return { ...rest, agmId, wbsId: agmId };
}

function fromSnapshot(snap: QueryDocumentSnapshot): Vessel {
  const data = snap.data() as VesselDoc;
  return toPublic({ ...data, id: snap.id, agmId: resolveAgmId(data, snap.id) });
}

/**
 * Shapes a listing for the PUBLIC site. Broker identity is admin-only, so the
 * internal `brokerId` link is dropped here; the public `Vessel` type does not
 * even carry the field once it leaves this module.
 */
function toPublic(v: Vessel): Vessel {
  const { brokerId: _brokerId, ...rest } = v;
  return rest;
}

/** Same as `fromSnapshot`, but keeps the draft/published flag. */
function fromAdminSnapshot(snap: QueryDocumentSnapshot): AdminVessel {
  const data = snap.data() as VesselDoc;
  return { ...data, id: snap.id, agmId: resolveAgmId(data, snap.id) } as AdminVessel;
}

/** All published listings, optionally narrowed to one category. */
export async function listPublishedVessels(category?: string): Promise<Vessel[]> {
  const ref = collection(getFirestoreDb(), COLLECTION);
  const snap = category
    ? await getDocs(
        query(ref, where("published", "==", true), where("category", "==", category)),
      )
    : await getDocs(query(ref, where("published", "==", true)));

  return snap.docs.map(fromSnapshot);
}

/**
 * Every listing including drafts. Admin-only.
 * The orderBy needs no composite index because it is not combined with an
 * equality filter, keeping the project on the Firestore free tier.
 */
export async function listAllVessels(): Promise<AdminVessel[]> {
  const snap = await getDocs(
    query(collection(getFirestoreDb(), COLLECTION), orderBy("category"), limit(1000)),
  );
  return snap.docs.map(fromAdminSnapshot);
}

/** Listing categories that currently hold at least one published vessel. */
export async function listCategories(): Promise<string[]> {
  const vessels = await listPublishedVessels();
  return Array.from(new Set(vessels.map((v) => v.category))).sort();
}

/** A single listing, or null. Drafts return null, mirroring the public rules. */
export async function getVessel(id: string): Promise<Vessel | null> {
  const snap = await getDoc(doc(getFirestoreDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  const data = snap.data() as VesselDoc;
  if (!data.published) return null;
  return toPublic({ ...data, id: snap.id, agmId: resolveAgmId(data, snap.id) });
}

/** Next free numeric id / AGM reference. Used when adding a listing. */
async function highestNumericSuffix(): Promise<number> {
  const snap = await getDocs(query(collection(getFirestoreDb(), COLLECTION), limit(1000)));
  let max = 999;
  for (const d of snap.docs) {
    const fromId = Number(d.id.replace(/^v-/, ""));
    if (Number.isFinite(fromId) && fromId > max) max = fromId;
    const fromAgm = Number(String(d.data().agmId ?? d.data().wbsId ?? "").replace(/\D/g, ""));
    if (Number.isFinite(fromAgm) && fromAgm > max) max = fromAgm;
  }
  return max;
}

export async function nextVesselId(): Promise<string> {
  return `v-${(await highestNumericSuffix()) + 1}`;
}

export async function nextAgmId(): Promise<string> {
  return `AGM ${(await highestNumericSuffix()) + 1}`;
}

export async function createVessel(
  vessel: Vessel,
  published = true,
  overwrite = false,
): Promise<void> {
  const ref = doc(getFirestoreDb(), COLLECTION, vessel.id);
  if (overwrite) {
    await setDoc(ref, {
      ...toDoc(vessel),
      published,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }
  // Fail loudly rather than silently clobbering an existing listing.
  if ((await getDoc(ref)).exists()) {
    throw new Error(`A listing with id "${vessel.id}" already exists.`);
  }
  await setDoc(ref, {
    ...toDoc(vessel),
    published,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Updates the editable fields of a listing, preserving `createdAt`. */
export async function updateVessel(vessel: Vessel, published = true): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), COLLECTION, vessel.id),
    { ...toDoc(vessel), published, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteVessel(id: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), COLLECTION, id));
}

/** Toggle draft/published without rewriting the rest of the document. */
export async function setVesselPublished(id: string, published: boolean): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), COLLECTION, id),
    { published, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * One-off repair for documents seeded before the `wbsId` → `agmId` rename:
 * persists the resolved listing ID wherever `agmId` is missing or blank.
 * Idempotent — a second run writes nothing. Returns the number of documents
 * updated so the dashboard can report it.
 */
export async function backfillAgmIds(): Promise<number> {
  const db = getFirestoreDb();
  const snap = await getDocs(query(collection(db, COLLECTION), limit(1000)));

  const missing: { id: string; agmId: string }[] = [];
  for (const d of snap.docs) {
    const data = d.data() as Pick<VesselDoc, "agmId" | "wbsId">;
    if (typeof data.agmId === "string" && data.agmId.trim() !== "") continue;
    missing.push({ id: d.id, agmId: resolveAgmId(data, d.id) });
  }

  // Firestore caps a batch at 500 writes, so commit in chunks like the seed.
  for (let i = 0; i < missing.length; i += 400) {
    const batch = writeBatch(db);
    for (const m of missing.slice(i, i + 400)) {
      batch.set(doc(db, COLLECTION, m.id), { agmId: m.agmId }, { merge: true });
    }
    await batch.commit();
  }
  return missing.length;
}

/**
 * Seeds the listings currently hard-coded in `src/data/vessels.ts`.
 *
 * Idempotent by default: existing documents are left untouched, so re-running
 * never duplicates a listing nor clobbers edits made through the dashboard.
 * Firestore caps a batch at 500 writes, so this commits in chunks.
 */
export async function seedVessels(
  overwrite = false,
): Promise<{ written: number; skipped: number }> {
  const db = getFirestoreDb();

  const existing = new Set<string>();
  if (!overwrite) {
    const snap = await getDocs(query(collection(db, COLLECTION), limit(1000)));
    snap.docs.forEach((d) => existing.add(d.id));
  }

  const all = await staticVessels();
  const pending = all.filter((v) => overwrite || !existing.has(v.id));
  const skipped = all.length - pending.length;

  for (let i = 0; i < pending.length; i += 400) {
    const batch = writeBatch(db);
    for (const vessel of pending.slice(i, i + 400)) {
      batch.set(doc(db, COLLECTION, vessel.id), {
        ...toDoc(vessel),
        published: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }

  return { written: pending.length, skipped };
}