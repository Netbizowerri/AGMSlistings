import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { missingFirebaseVars } from "./firebaseConfig";

/**
 * Firebase Web SDK bootstrap.
 *
 * This module is only ever imported from the lazy-loaded admin route and from
 * dynamically imported Firestore reads, so the SDK is excluded from the initial
 * public-site bundle.
 *
 * The config values come from Vite env vars (see `.env.example`) rather than a
 * hard-coded object, which lets a Firebase project be swapped without editing
 * source. These values are client-side and therefore NOT secrets: all real
 * authorization is enforced by Firebase Auth plus the Firestore security rules
 * in `firestore.rules`. Never place a service-account key or private key here.
 */

export { firebaseConfigured } from "./firebaseConfig";

function readConfig() {
  if (missingFirebaseVars.length > 0) {
    throw new Error(
      `Firebase is not configured. Missing environment variable(s): ${missingFirebaseVars.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in the values from the Firebase console " +
        "(Project settings -> Your apps -> Web app -> SDK setup).",
    );
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/** Initializes (once) and returns the Firebase app. */
export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length > 0 ? getApp() : initializeApp(readConfig());
  return app;
}

/** Firebase Authentication instance. */
export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

/** Cloud Firestore instance. */
export function getFirestoreDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}