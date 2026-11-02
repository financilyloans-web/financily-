import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { DocumentReference } from "firebase-admin/firestore";
import { randomBytes } from "crypto";

/**
 * GET /api/payments/youpi-order?mobile=<10-digit>
 *
 * Authoritative order resolution for the YouPI checkout, keyed by the
 * borrower's MOBILE NUMBER (not an order id, per product requirement).
 *
 * The endpoint is intentionally PUBLIC (no sign-in), so anyone can pay an EMI
 * without a Firebase account. Payment is only possible when an admin has
 * explicitly enabled EMI payment for that mobile number and set the payable
 * amount (see /api/admin/emi). We return only the minimal data needed to pay
 * (orderId + amount) — no borrower PII is exposed.
 */
const MOBILE_RE = /^[6-9]\d{9}$/;

function makePayToken(): string {
  return randomBytes(16).toString("hex");
}

export async function GET(req: NextRequest) {
  const mobile = (req.nextUrl.searchParams.get("mobile") || "").trim();
  if (!MOBILE_RE.test(mobile)) {
    return NextResponse.json(
      { error: "A valid 10-digit mobile number is required." },
      { status: 400 },
    );
  }

  try {
    // NOTE: full collection-group scan + in-memory mobile filter, mirroring the
    // verify route, so no composite Firestore index is required. If the app
    // grows, add a COLLECTION_GROUP_ASC index on `mobile` and switch this to
    // `.where("mobile", "==", mobile)`.
    const snapshot = await adminDb().collectionGroup("applications").get();

    // Match on admin-enablement alone. The amount is validated separately below
    // so that an enabled loan with a bad amount surfaces a clear 409 instead of
    // silently falling through to a 404.
    let match: { ref: DocumentReference; data: Record<string, any> } | null = null;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.mobile !== mobile) continue;
      if (data.status === "rejected") continue;
      if (data.emiEligible === true) {
        match = { ref: doc.ref, data };
        break;
      }
    }

    if (!match) {
      return NextResponse.json(
        { error: "No active EMI payment is enabled for this mobile number." },
        { status: 404 },
      );
    }

    // Ensure the loan has a random bearer token to derive the order id.
    let payToken = match.data.payToken as string | undefined;
    if (!payToken) {
      payToken = makePayToken();
      await match.ref.update({ payToken });
    }

    // Validate the admin-set EMI amount explicitly rather than letting 0 / NaN
    // slip through (mirrors the guard in youpi-verify).
    const rawAmount = Number(match.data.emiAmount);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "No valid EMI amount is configured for this mobile number." },
        { status: 409 },
      );
    }

    const orderId = `EMI-${payToken}`;
    const amount = rawAmount;

    // Deliberately do NOT return borrower PII (e.g. refNumber) from this public
    // endpoint — the checkout only needs orderId + amount.
    return NextResponse.json({
      orderId,
      amount,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[payments/youpi-order] error:", err);
    return NextResponse.json({ error: "Could not resolve order." }, { status: 500 });
  }
}
