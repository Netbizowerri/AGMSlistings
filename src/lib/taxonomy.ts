import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import {
  defaultTerms,
  normalizeTermName,
  termSlug,
  type TaxonomyKind,
  type TaxonomyTerm,
} from "../data/taxonomy";

/**
 * Admin-managed vessel taxonomy.
 *
 * Two Firestore collections back the category and sector dropdowns:
 *
 *   categories/{slug}  { name, createdAt, updatedAt }
 *   sectors/{slug}     { name, createdAt, updatedAt }
 *
 * The document id is a slug of the name, which makes an "add" idempotent and
 * keeps lookups by name cheap. Public visitors may READ both collections so the
 * search dropdowns follow the admin's taxonomy; only admins may write (see
 * firestore.rules). This module is imported only from the lazy-loaded admin
 * page, so the Firestore SDK never reaches the public bundle.
 */

export type { TaxonomyKind, TaxonomyTerm };

/** Lists a taxonomy, sorted by name. */
export async function listTerms(kind: TaxonomyKind): Promise<TaxonomyTerm[]> {
  const snap = await getDocs(collection(getFirestoreDb(), kind));
  return snap.docs
    .map((d) => {
      const data = d.data() as { name?: unknown };
      return { id: d.id, name: String(data.name ?? "").trim() };
    })
    .filter((t) => t.name !== "")
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Names of every term, sorted — the shape the public hook consumes. */
export async function listTermNames(kind: TaxonomyKind): Promise<string[]> {
  return (await listTerms(kind)).map((t) => t.name);
}

/** Adds a term. Throws if the (slug-normalised) name is already present. */
export async function addTerm(kind: TaxonomyKind, name: string): Promise<void> {
  const clean = normalizeTermName(name);
  if (!clean) throw new Error("Enter a name.");
  if (clean.length > 80) throw new Error("Name is too long (80 characters max).");

  const ref = doc(getFirestoreDb(), kind, termSlug(clean));
  if ((await getDoc(ref)).exists()) {
    throw new Error(`"${clean}" is already in the list.`);
  }
  await setDoc(ref, {
    name: clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTerm(kind: TaxonomyKind, id: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), kind, id));
}

/**
 * Idempotent seed of the shipped taxonomy. Existing terms are left untouched
 * (matched by slug), so re-running never duplicates nor clobbers admin edits.
 */
export async function seedTerms(kind: TaxonomyKind): Promise<number> {
  const db = getFirestoreDb();
  const existing = new Set((await listTerms(kind)).map((t) => t.id));
  const pending = defaultTerms(kind).filter((name) => !existing.has(termSlug(name)));

  for (let i = 0; i < pending.length; i += 400) {
    const batch = writeBatch(db);
    for (const name of pending.slice(i, i + 400)) {
      batch.set(doc(db, kind, termSlug(name)), {
        name: normalizeTermName(name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }
  return pending.length;
}
