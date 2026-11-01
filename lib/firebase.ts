import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase client initialisation.
 *
 * Configuration is read from NEXT_PUBLIC_FIREBASE_* environment variables.
 * The app builds and runs even when these are absent — in that case
 * `firebaseConfigured` is false and auth/database calls return a friendly
 * "not configured" message. Add the env vars to activate real auth.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

export const FIREBASE_MESSAGE =
  "Firebase is not configured yet. Add NEXT_PUBLIC_FIREBASE_* environment variables to enable authentication.";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (firebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Firebase init error:", err);
  }
}

export { auth, db };
