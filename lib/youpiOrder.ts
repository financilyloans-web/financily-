import "server-only";
import { adminDb } from "@/lib/firebaseAdmin";
import { randomBytes } from "crypto";

/**
 * Shared order-resolution helpers for the YouPI checkout.
 *
 * The checkout orderId is ALWAYS a server-side random bearer token
 * (`EMI-<payToken>`), never a borrower's mobile number. This keeps the public
 * (unauthenticated) order endpoint from leaking PII — knowing a phone number
 * alone must not let anyone confirm EMI enablement or amounts.
 *
 * Admin provisioning remains keyed by mobile (see /api/admin/emi); lookups
 * resolve the loan for a mobile, then derive the payment token inside.
 */

export const ORDER_ID_RE = /^EMI-[0-9a-f]{32}$/;
export const MOBILE_RE = /^[6-9]\d{9}$/;

/** Generate a high-entropy 128-bit hex bearer token (orderId suffix). */
export function makePayToken(): string {
  return randomBytes(16).toString("hex");
}

/** Coerce a Firestore value to a comparable number for ordering/sorting. */
function toMillis(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "object") {
    const t = v as { toMillis?: () => number };
    if (typeof t.toMillis === "function") return t.toMillis();
  }
  if (typeof v === "string") {
    const n = Date.parse(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export interface LoanRef {
  /** Persists a field update back to the loan document. */
  update(data: Record<string, unknown>): Promise<unknown>;
}

export interface LoanRecord {
  ref: LoanRef;
  data: Record<string, any>;
}

/** Best-effort type guard for a Firestore document reference-like update fn. */
function refOf(doc: { ref?: { update(x: Record<string, unknown>): Promise<unknown> }; update?(x: Record<string, unknown>): Promise<unknown> }): LoanRef {
  if (doc?.ref?.update) return { update: (x) => doc.ref!.update(x) };
  return { update: () => Promise.resolve() };
}

/**
 * Resolve the active EMI-eligible loan for a mobile number.
 *
 * Uses a targeted, indexed query by mobile (narrowing to that borrower only),
 * then deterministically selects the LATEST EMI-eligible application by
 * createdAt. Falls back to a scan only if the required Firestore index has not
 * been deployed yet (FAILED_PRECONDITION), so it works before/after index
 * deployment.
 */
export async function resolveEmiLoanByMobile(
  mobile: string,
): Promise<LoanRecord | null> {
  const Q = () => adminDb().collectionGroup("applications");

  const tryIndexed = async (): Promise<LoanRecord | null> => {
    // Requires a COLLECTION_GROUP composite index on (mobile ASC, emiEligible
    // ASC, createdAt DESC) — declared in firestore.indexes.json.
    const snap = await Q()
      .where("mobile", "==", mobile)
      .where("emiEligible", "==", true)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    const d = snap.docs[0];
    if (!d) return null;
    const data = d.data();
    if (data.status === "rejected") return null;
    return { ref: refOf(d), data };
  };

  try {
    const hit = await tryIndexed();
    if (hit) return hit;
  } catch (err: any) {
    // FAILED_PRECONDITION means the index is not deployed yet — fall through to
    // the mobile-only query, then the full scan.
    if (!(err?.code === 9 || /FAILED_PRECONDITION/.test(String(err?.message)))) throw err;
  }

  // Fallback 1: mobile-only query (index on mobile alone).
  try {
    const snap = await Q().where("mobile", "==", mobile).get();
    let best: { ref: LoanRef; data: Record<string, any>; createdAt: number } | null = null;
    for (const d of snap.docs) {
      const data = d.data();
      if (data.status === "rejected") continue;
      if (data.emiEligible !== true) continue;
      const at = toMillis(data.createdAt);
      if (!best || at > best.createdAt) {
        best = { ref: refOf(d), data, createdAt: at };
      }
    }
    return best ? { ref: best.ref, data: best.data } : null;
  } catch (err: any) {
    if (!(err?.code === 9 || /FAILED_PRECONDITION/.test(String(err?.message)))) throw err;
  }

  // Fallback 2: full scan (no mobile index deployed at all).
  const snapshot = await Q().get();
  let best: { ref: LoanRef; data: Record<string, any>; createdAt: number } | null = null;
  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.mobile !== mobile) continue;
    if (data.status === "rejected") continue;
    if (data.emiEligible !== true) continue;
    const at = toMillis(data.createdAt);
    if (!best || at > best.createdAt) {
      best = { ref: refOf(d), data, createdAt: at };
    }
  }
  return best ? { ref: best.ref, data: best.data } : null;
}

/**
 * Resolve a loan by its payment token (orderId suffix). Uses the targeted,
 * indexed payToken query; falls back to a scan until the index is deployed.
 */
export async function resolveLoanByPayToken(
  token: string,
): Promise<LoanRecord | null> {
  try {
    const snap = await adminDb()
      .collectionGroup("applications")
      .where("payToken", "==", token)
      .limit(1)
      .get();
    const d = snap.docs[0];
    if (!d) return null;
    return { ref: refOf(d), data: d.data() };
  } catch (err: any) {
    if (!(err?.code === 9 || /FAILED_PRECONDITION/.test(String(err?.message)))) throw err;
  }
  const snapshot = await adminDb().collectionGroup("applications").get();
  for (const d of snapshot.docs) {
    if (d.data()?.payToken === token) {
      return { ref: refOf(d), data: d.data() };
    }
  }
  return null;
}

/** Ensure a loan has a bearer token, persisting one if missing. */
export async function ensurePayToken(loan: LoanRecord): Promise<string> {
  let token = loan.data.payToken as string | undefined;
  if (!token || !ORDER_ID_RE.test(`EMI-${token}`)) {
    token = makePayToken();
    await loan.ref.update({ payToken: token });
  }
  return token;
}
