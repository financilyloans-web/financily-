import "server-only";
import { initializeApp, cert, getApps, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

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
 */

/** Resolve the service-account key path (env override, else staff/). */
export function serviceAccountPath(): string {
  return (
    process.env.SERVICE_ACCOUNT_PATH ||
    path.join(process.cwd(), "staff", "service-account.json")
  );
}

/**
 * Best-effort check whether the Firebase Admin SDK can initialize. Returns
 * false (without throwing) when the service-account key is absent. Used to
 * return a clean JSON error from API routes instead of an unhandled crash.
 */
export function isAdminConfigured(): boolean {
  try {
    const keyPath = serviceAccountPath();
    if (!fs.existsSync(keyPath)) return false;
    const parsed = JSON.parse(fs.readFileSync(keyPath, "utf8")) as {
      client_email?: string;
      private_key?: string;
    };
    return !!(parsed.client_email && parsed.private_key);
  } catch {
    return false;
  }
}

function ensureServiceAccount(): ServiceAccount {
  const keyPath = serviceAccountPath();

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Admin service-account key not found at ${keyPath}. ` +
        "Add it (Firebase Console → Project settings → Service accounts → Generate new private key) " +
        "or set SERVICE_ACCOUNT_PATH=/path/to/key.json.",
    );
  }

  const raw = fs.readFileSync(keyPath, "utf8");
  const parsed = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
    type?: string;
  };
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service-account key is missing client_email / private_key.");
  }
  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const serviceAccount = ensureServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

/** Firebase Admin Auth (user management + ID-token verification). */
export const adminAuth = () => getAuth(getAdminApp());

/** Firebase Admin Firestore (server-side DB access, bypasses client rules). */
export const adminDb = () => getFirestore(getAdminApp());
