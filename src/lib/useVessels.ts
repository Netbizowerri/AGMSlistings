import { useEffect, useState } from "react";
import { firebaseConfigured } from "./firebaseConfig";
import { vessels as staticVessels, type Vessel } from "../data/vessels";

/**
 * Reads published listings from Firestore, falling back to the static
 * `src/data/vessels.ts` catalogue.
 *
 * The fallback matters for two reasons:
 *  1. A visitor with no Firebase config (or a Firestore outage) still sees the
 *     full catalogue instead of an empty page.
 *  2. It keeps the public site working before the seed has been run.
 *
 * Firestore values are cached for the session so navigating between pages does
 * not re-read the collection on every render, which matters on the free tier's
 * daily read budget.
 */

type State = {
  vessels: Vessel[];
  loading: boolean;
  /** True when the static catalogue is being shown instead of Firestore. */
  usingFallback: boolean;
};

let cache: Vessel[] | null = null;
let inFlight: Promise<Vessel[]> | null = null;

async function fetchOnce(): Promise<Vessel[]> {
  if (!firebaseConfigured) return staticVessels;
  if (cache) return cache;

  // Dynamic import: the Firestore SDK is a large dependency and must not sit in
  // the initial public bundle. It is fetched after first paint, while the page
  // already shows the static catalogue.
  inFlight ??= import("./vessels")
    .then((m) => m.listPublishedVessels())
    .then((rows) => {
      // An empty collection means the seed has not run yet; use the static
      // catalogue rather than showing the site with zero listings.
      if (rows.length === 0) return staticVessels;
      cache = rows;
      return rows;
    })
    .catch(() => staticVessels)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function usePublishedVessels(): State {
  const [state, setState] = useState<State>(() => ({
    vessels: cache ?? staticVessels,
    loading: cache === null,
    usingFallback: cache === null,
  }));

  useEffect(() => {
    let active = true;
    fetchOnce().then((rows) => {
      if (!active) return;
      // Compare by the resolved list, not by reference identity: on a cache hit
      // `rows` can be `staticVessels` while still being live Firestore data.
      setState({
        vessels: rows,
        loading: false,
        usingFallback: rows !== cache && cache === null,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/** Looks up one listing by its public id, with the same fallback behaviour. */
export function useVessel(id: string | undefined): {
  vessel: Vessel | undefined;
  loading: boolean;
} {
  const { vessels, loading } = usePublishedVessels();
  return { vessel: vessels.find((v) => v.id === id), loading };
}

/** Test/reset hook for the module-level cache. */
export function clearVesselCache(): void {
  cache = null;
}