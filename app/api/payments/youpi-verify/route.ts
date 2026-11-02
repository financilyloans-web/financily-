import { NextRequest, NextResponse } from "next/server";
import {
  verifyYoupiOrder,
  youpiConfigured,
} from "@/lib/youpi";
import { ORDER_ID_RE, resolveLoanByPayToken } from "@/lib/youpiOrder";

/**
 * POST /api/payments/youpi-verify
 *
 * Verifies a YouPI payment. The orderId (`EMI-<payToken>`) and the gateway
 * paymentId are required; we re-resolve the authoritative order ourselves — by
 * the loan's payToken — and verify against the authoritative admin-set amount.
 * Any client-supplied amount/orderId are ignored, so a tampered client cannot
 * cause a wrong amount to be verified.
 */
export async function POST(req: NextRequest) {
  if (!youpiConfigured()) {
    return NextResponse.json(
      { error: "Payment gateway is not configured yet.", confirmed: false },
      { status: 503 },
    );
  }

  let body: { orderId?: unknown; paymentId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";

  if (!ORDER_ID_RE.test(orderId)) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
  }

  try {
    const loan = await resolveLoanByPayToken(orderId.slice("EMI-".length));
    if (!loan) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    const data = loan.data;

    if (data.status === "rejected") {
      return NextResponse.json(
        { error: "This loan has been rejected and cannot be paid." },
        { status: 409 },
      );
    }

    // Payment must be explicitly enabled by an admin for this loan, and the
    // amount payable is the admin-set EMI amount (never derived client-side).
    if (data.emiEligible !== true) {
      return NextResponse.json(
        { error: "EMI payment is not enabled for this loan." },
        { status: 403 },
      );
    }

    // Use the EXACT stored EMI amount (paise-preserving) so verification matches
    // the session-created amount and the 0.01 tolerance in verifyYoupiOrder.
    const emiAmount = Number(data.emiAmount);
    const amount = Number.isFinite(emiAmount) && emiAmount > 0 ? emiAmount : 0;
    if (amount <= 0) {
      return NextResponse.json(
        { error: "No EMI amount has been configured for this loan." },
        { status: 409 },
      );
    }

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
