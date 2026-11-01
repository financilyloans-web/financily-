import { NextRequest, NextResponse } from "next/server";
import {
  verifyYoupiOrder,
  youpiConfigured,
} from "@/lib/youpi";
import { adminAuth } from "@/lib/firebaseAdmin";

/**
 * POST /api/payments/youpi-verify
 *
 * Authoritative, server-side payment verification. The browser never trusts the
 * `youpi:payment:success` event (which is spoofable). Instead, the client calls
 * this endpoint after the payment flow, and we ask the YouPI gateway directly
 * (authenticated with the merchant API key) whether the order was actually paid.
 *
 * Only when the gateway confirms a settled status, the order identity matches,
 * and the amount matches do we return `confirmed: true` — and only then should
 * the UI show success.
 *
 * AUTH: The caller must present a valid Firebase ID token. This prevents
 * unauthenticated callers from enumerating orders or leaking payment state.
 */
export async function POST(req: NextRequest) {
  // 1. Require an authenticated caller. Reject early to avoid exposing any
  //    gateway state to unauthenticated clients.
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }
  try {
    await adminAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid or expired authorization token." }, { status: 401 });
  }

  if (!youpiConfigured()) {
    return NextResponse.json(
      { error: "Payment gateway is not configured yet.", confirmed: false },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { orderId, paymentId, amount } = (body ?? {}) as {
    orderId?: string;
    paymentId?: string;
    amount?: number;
  };

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json(
      { error: "orderId is required." },
      { status: 400 },
    );
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number." },
      { status: 400 },
    );
  }

  try {
    const result = await verifyYoupiOrder({ orderId, paymentId, amount });
    return NextResponse.json({
      confirmed: result.confirmed && result.amountMatch,
      status: result.status,
      orderId: result.orderId,
      paymentId: result.paymentId,
      amountMatch: result.amountMatch,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[payments/youpi-verify] error:", err);
    return NextResponse.json(
      { error: err?.message || "Could not verify payment.", confirmed: false },
      { status: 500 },
    );
  }
}
