/**
 * Dependency-free taxonomy helpers shared by the public bundle and the admin.
 *
 * Categories and sectors used to be hard-coded (CATEGORY_LIST here in
 * `data/vessels.ts`, plus a literal array in the vessel form). They are now
 * admin-managed Firestore data, but the public site still needs a sensible
 * list before the admin has seeded anything (and when Firebase is not
 * configured at all). Everything in this file is pure — no Firebase SDK — so
 * importing it never drags Firestore into the public bundle. The Firestore
 * CRUD lives in `lib/taxonomy.ts`.
 */

import { CATEGORY_LIST } from "./vessels";

/** The two admin-managed taxonomies. */
export type TaxonomyKind = "categories" | "sectors";

/** A taxonomy entry as shown in the admin (carries its Firestore id). */
export type TaxonomyTerm = {
  id: string;
  name: string;
};

/** The sectors that ship with the site, used until the admin edits them. */
export const DEFAULT_SECTORS = ["For sale", "For charter", "For sale or charter"];

/** The shipped taxonomy, used as a fallback before Firestore is seeded. */
export function defaultTerms(kind: TaxonomyKind): string[] {
  return kind === "categories" ? [...CATEGORY_LIST] : [...DEFAULT_SECTORS];
}

/** Firestore document id for a term: lowercase, non-alphanumerics collapsed to "-". */
export function termSlug(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "term"
  );
}

/** Normalises user input: trims and collapses internal whitespace. */
export function normalizeTermName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
