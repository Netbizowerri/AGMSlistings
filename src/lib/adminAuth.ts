import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  getIdTokenResult,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "./firebase";

/**
 * Admin authentication.
 *
 * There is no sign-up form in the UI: `/adminlogin` is sign-in only, and
 * accounts are created in the Firebase console. That means nobody can
 * self-register their way into the dashboard.
 *
 * Access is governed by an `admins/{uid}` document. The two owner emails are
 * allowed in `firestore.rules` to self-provision that document on first
 * sign-in, so no manual console seeding is needed; after that the document is
 * the source of truth.
 */

const ADMINS = "admins";

/** Emails permitted to self-provision an `admins/{uid}` document. */
export const BOOTSTRAP_EMAILS = ["netbiz0925@gmail.com", "planalternative534@gmail.com"];

export async function signInAdmin(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export function signOutAdmin(): Promise<void> {
  return signOut(getFirebaseAuth());
}

export function sendAdminPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(getFirebaseAuth(), email);
}

export function watchAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

/**
 * Ensures an `admins/{uid}` document exists for this user.
 *
 * Returns true only if the user is an admin. A signed-in non-owner is rejected
 * here in the UI *and* by Firestore rules, so hiding the UI is defence in
 * depth rather than the control itself.
 */
export async function ensureAdminClaim(user: User): Promise<boolean> {
  const ref = doc(getFirestoreDb(), ADMINS, user.uid);
  const email = user.email ?? "";

  try {
    if ((await getDoc(ref)).exists()) {
      // Confirm the token so Firestore authorises subsequent writes.
      await getIdTokenResult(user, true);
      return true;
    }

    if (!BOOTSTRAP_EMAILS.includes(email)) return false;

    await setDoc(ref, { email, createdAt: serverTimestamp() });
    await getIdTokenResult(user, true);
    return true;
  } catch (err) {
    // Surface the real reason instead of a bare "access denied": a
    // permission-denied here usually means the deployed rules are stale.
    console.error("ensureAdminClaim failed", err);
    return false;
  }
}