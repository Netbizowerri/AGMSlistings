/**
 * Firebase env-var presence check, deliberately free of any Firebase SDK
 * import.
 *
 * This module is imported by public pages, so anything it pulls in ends up in
 * the main bundle. Keep it dependency-free: `firebase.ts` imports the SDK, and
 * importing that from here would drag ~550 kB of Auth + Firestore onto every
 * public page load.
 */

const REQUIRED_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

export const firebaseConfigured = REQUIRED_VARS.every(
  (key) => typeof import.meta.env[key] === "string" && import.meta.env[key].trim() !== "",
);

export const missingFirebaseVars = REQUIRED_VARS.filter(
  (key) => !import.meta.env[key] || import.meta.env[key].trim() === "",
);