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
  createdAt?: unknown;
  updatedAt?: unknown;
};

const COLLECTION = "vessels";

/** Strips the public `id` (it becomes the document id) for a clean write. */
function toDoc(vessel: Vessel) {
  const { id: _id, ...rest } = vessel;
  return rest;
}

function fromSnapshot(snap: QueryDocumentSnapshot): Vessel {
  return { ...(snap.data() as VesselDoc), id: snap.id };
}

/** Same as `fromSnapshot`, but keeps the draft/published flag. */
function fromAdminSnapshot(snap: QueryDocumentSnapshot): AdminVessel {
  return { ...(snap.data() as VesselDoc), id: snap.id } as AdminVessel;
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
  return { ...data, id: snap.id };
}

/** Next free numeric id / WBS reference. Used when adding a listing. */
async function highestNumericSuffix(): Promise<number> {
  const snap = await getDocs(query(collection(getFirestoreDb(), COLLECTION), limit(1000)));
  let max = 999;
  for (const d of snap.docs) {
    const fromId = Number(d.id.replace(/^v-/, ""));
    if (Number.isFinite(fromId) && fromId > max) max = fromId;
    const fromWbs = Number(String(d.data().wbsId ?? "").replace(/\D/g, ""));
    if (Number.isFinite(fromWbs) && fromWbs > max) max = fromWbs;
  }
  return max;
}

export async function nextVesselId(): Promise<string> {
  return `v-${(await highestNumericSuffix()) + 1}`;
}

export async function nextWbsId(): Promise<string> {
  return `WBS ${(await highestNumericSuffix()) + 1}`;
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