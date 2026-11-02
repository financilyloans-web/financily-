import "server-only";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import type { App, ServiceAccount } from "firebase-admin/app";

/**
 * Server-side Firebase Admin SDK initializer.
 *
 * This module must only ever be imported from server code (Next.js route
 * handlers / server components). It uses the project's service-account key —
 * downloaded from the Firebase Console (Project settings → Service accounts →
 * Generate new private key) — located at `staff/service-account.json`, or at
 * the path given by `SERVICE_ACCOUNT_PATH`.
 *
 * The key is git-ignored and never leaves the server.
 * WARNING: never import this into a client component.
 *
 * NOTE: `firebase-admin` is deliberately loaded lazily via `require()` at
 * first use, NOT via a static top-level import. A static import would fail the
 * entire route module at load time if the package is missing/broken on the
 * host (producing an HTML 500 that no handler try/catch can intercept). With
 * lazy loading, any failure surfaces inside the calling handler's try/catch,
 * so API routes always return JSON.
 */

const require = createRequire(import.meta.url);

// Lazy module caches. The `type` imports above are erased at compile time, so
// these load no runtime dependency at module scope.
let appModule: typeof import("firebase-admin/app") | undefined;
let authModule: typeof import("firebase-admin/auth") | undefined;
let firestoreModule: typeof import("firebase-admin/firestore") | undefined;

function loadAppModule() {
  if (!appModule) appModule = require("firebase-admin/app");
  return appModule!;
}
function loadAuthModule() {
  if (!authModule) authModule = require("firebase-admin/auth");
  return authModule!;
}
function loadFirestoreModule() {
  if (!firestoreModule) firestoreModule = require("firebase-admin/firestore");
  return firestoreModule!;
}
/**
 * Resolve the service-account configuration. Supports all the common ways a
 * hosting platform provides it:
 *   - `FIREBASE_SERVICE_ACCOUNT` env var → raw JSON string of the key.
 *   - `SERVICE_ACCOUNT_PATH` / `GOOGLE_APPLICATION_CREDENTIALS` env var → path
 *     to the key file.
 *   - default: `staff/service-account.json` in the project root.
 * Returns null when none is configured/valid.
 */
export function loadServiceAccount(): ServiceAccount | null {
  try {
    // 1. Raw JSON in an env var (commonly used by Vercel/Render/…).
    const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (rawEnv) {
      const parsed = JSON.parse(rawEnv) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key,
        };
      }
      return null;
    }

    // 2. Path to the key file.
    const keyPath =
      process.env.SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(process.cwd(), "staff", "service-account.json");
    if (!fs.existsSync(keyPath)) return null;

    const parsed = JSON.parse(fs.readFileSync(keyPath, "utf8")) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  } catch {
    return null;
  }
}

/** Resolve the service-account key file path (for error messages). */
export function serviceAccountPath(): string {
  return (
    process.env.SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), "staff", "service-account.json")
  );
}

/**
 * Best-effort check whether the Firebase Admin SDK can initialize. Returns
 * false (without throwing) when the service-account key is absent. Used to
 * return a clean JSON error from API routes instead of an unhandled crash.
 */
export function isAdminConfigured(): boolean {
  return loadServiceAccount() !== null;
}

function ensureServiceAccount(): ServiceAccount {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Admin service-account key is not configured. " +
        "Add it via FIREBASE_SERVICE_ACCOUNT (JSON), SERVICE_ACCOUNT_PATH " +
        "or GOOGLE_APPLICATION_CREDENTIALS, or place it at " +
        "staff/service-account.json.",
    );
  }
  return serviceAccount;
}

function getAdminApp(): App {
  const { getApps, initializeApp, cert } = loadAppModule();
  const existing = getApps();
  if (existing.length) return existing[0];

  const serviceAccount = ensureServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

/** Firebase Admin Auth (user management + ID-token verification). */
export const adminAuth = () => loadAuthModule().getAuth(getAdminApp());

/** Firebase Admin Firestore (server-side DB access, bypasses client rules). */
export const adminDb = () => loadFirestoreModule().getFirestore(getAdminApp());
