import { NextRequest, NextResponse } from "next/server";
import {
  createYoupiSession,
  youpiConfigured,
} from "@/lib/youpi";
import { PAYMENT_RECEIVER } from "@/lib/paymentReceiver";

/**
 * POST /api/payments/youpi
 * Creates a YouPI payment session for an EMI payment. The merchant API key
 * lives only on the server (see lib/youpi.ts); the browser receives just the
 * checkout URL to open in the YouPI modal.
 *
 * Request body:
 *   { orderId, amount, description?, customer?, returnUrl?, metadata? }
 */
export async function POST(req: NextRequest) {
  if (!youpiConfigured()) {
    return NextResponse.json(
      { error: "Payment gateway is not configured yet.", configured: false },
      { status: 503 },
    );
  }

  let body: {
    orderId?: unknown;
    amount?: unknown;
    description?: unknown;
    customer?: unknown;
    returnUrl?: unknown;
    metadata?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const amount = Number(body.amount);
  const description = typeof body.description === "string" ? body.description : undefined;
  const returnUrl = typeof body.returnUrl === "string" ? body.returnUrl : undefined;
  const customer =
    body.customer && typeof body.customer === "object"
      ? (body.customer as { name?: string; email?: string; phoneNumber?: string })
      : undefined;
  const metadata =
    body.metadata && typeof body.metadata === "object"
      ? (body.metadata as Record<string, string>)
      : undefined;

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number." }, { status: 400 });
  }

  try {
    const session = await createYoupiSession({
      orderId,
      amount,
      description,
      customer,
      returnUrl,
      metadata: {
        ...metadata,
        receiver_payee: PAYMENT_RECEIVER.payeeName,
        receiver_upi: PAYMENT_RECEIVER.upiId,
      },
    });
    return NextResponse.json({ ok: true, session, receiver: PAYMENT_RECEIVER });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[payments/youpi] error:", err);
    return NextResponse.json(
      { error: err?.message || "Could not create payment session." },
      { status: 500 },
    );
  }
}
