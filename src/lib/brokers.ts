import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "./firebase";

/**
 * Third-party brokers who list vessels through AGMS.
 *
 * Broker identities are PERSONAL DATA and are deliberately NOT stored on the
 * vessel document — the vessel only carries an opaque `brokerId`. The actual
 * name and contact live here, in a collection that the Firestore security rules
 * restrict to admins, so anonymous visitors can never read them (not even by
 * querying the raw API).
 */

export type Broker = {
  id: string;
  /** Broker business name — the identity used to group listings. */
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const COLLECTION = "brokers";

/**
 * Normalises a raw document into the Broker shape. Legacy records (created
 * before the contact section) carry a single free-text `contact` field, which
 * is surfaced as `phone` until the record is next saved from the form.
 */
function normalize(
  data: { name?: unknown; phone?: unknown; email?: unknown; address?: unknown; contact?: unknown },
): Omit<Broker, "id"> {
  return {
    name: typeof data.name === "string" ? data.name : "",
    phone:
      typeof data.phone === "string"
        ? data.phone
        : typeof data.contact === "string"
        ? data.contact
        : "",
    email: typeof data.email === "string" ? data.email : "",
    address: typeof data.address === "string" ? data.address : "",
  };
}

/** Every broker record. Admin-only (enforced by the security rules). */
export async function listBrokers(): Promise<Broker[]> {
  const snap = await getDocs(query(collection(getFirestoreDb(), COLLECTION)));
  return snap.docs.map((d) => ({ ...normalize(d.data()), id: d.id }));
}

export async function getBroker(id: string): Promise<Broker | null> {
  const snap = await getDoc(doc(getFirestoreDb(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { ...normalize(snap.data()), id: snap.id };
}

/**
 * Returns the id of an existing broker with the given business name (updating
 * its contact details on the way), or creates a new broker record and returns
 * its id. Used by the vessel form so saving a listing idempotently reuses one
 * record per broker rather than duplicating.
 */
export async function resolveBrokerId(
  name: string,
  phone: string,
  email: string,
  address: string,
): Promise<string> {
  const db = getFirestoreDb();
  const nameKey = name.trim();

  const snap = await getDocs(query(collection(db, COLLECTION), where("name", "==", nameKey)));
  const existing = snap.docs[0];

  const fields = {
    name: nameKey,
    phone: phone.trim(),
    email: email.trim(),
    address: address.trim(),
    updatedAt: serverTimestamp(),
  };

  if (existing) {
    await setDoc(doc(db, COLLECTION, existing.id), fields, { merge: true });
    return existing.id;
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    ...fields,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Permanently removes a broker record. Admins should clear the vessels' `brokerId` first (the UI does this). */
export async function deleteBroker(id: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), COLLECTION, id));
}