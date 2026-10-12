import { useEffect, useState } from "react";
import { firebaseConfigured } from "./firebaseConfig";
import { defaultTerms, type TaxonomyKind } from "../data/taxonomy";

/**
 * Reads the admin-managed category/sector lists from Firestore, falling back to
 * the shipped taxonomy (`defaultTerms`).
 *
 * Mirrors `useVessels`: the Firestore SDK is loaded via dynamic import so it
 * stays out of the public bundle, results are cached for the session so
 * navigating between pages does not re-read the collections, and an empty
 * collection (seed not run) falls back to the shipped list rather than showing
 * a visitor an empty dropdown.
 */

type State = {
  terms: string[];
  loading: boolean;
};

const cache: Record<TaxonomyKind, string[] | null> = { categories: null, sectors: null };
const inFlight: Record<TaxonomyKind, Promise<string[]> | null> = {
  categories: null,
  sectors: null,
};

async function fetchOnce(kind: TaxonomyKind): Promise<string[]> {
  if (!firebaseConfigured) return defaultTerms(kind);
  if (cache[kind]) return cache[kind] as string[];

  inFlight[kind] ??= import("./taxonomy")
    .then((m) => m.listTermNames(kind))
    .then((names) => {
      if (names.length === 0) return defaultTerms(kind);
      cache[kind] = names;
      return names;
    })
    .catch(() => defaultTerms(kind))
    .finally(() => {
      inFlight[kind] = null;
    });

  return inFlight[kind] as Promise<string[]>;
}

export function useTaxonomy(kind: TaxonomyKind): State {
  const [state, setState] = useState<State>(() => ({
    terms: cache[kind] ?? defaultTerms(kind),
    loading: cache[kind] === null,
  }));

  useEffect(() => {
    let active = true;
    fetchOnce(kind).then((terms) => {
      if (active) setState({ terms, loading: false });
    });
    return () => {
      active = false;
    };
  }, [kind]);

  return state;
}

/** Test/reset hook for the module-level caches. */
export function clearTaxonomyCache(): void {
  cache.categories = null;
  cache.sectors = null;
}
