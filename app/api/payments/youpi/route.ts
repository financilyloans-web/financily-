import { NextRequest, NextResponse } from "next/server";
import {
  createYoupiSession,
  youpiConfigured,
} from "@/lib/youpi";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { PAYMENT_RECEIVER } from "@/lib/paymentReceiver";
import { ORDER_ID_RE, resolveLoanByPayToken } from "@/lib/youpiOrder";

/**
 * POST /api/payments/youpi
 * Creates a YouPI payment session for an EMI payment. The merchant API key
 * never leaves the server. The order is resolved AUTHORITATIVELY server-side
 * from the loan's payToken (embedded in the orderId `EMI-<payToken>`), so the
 * client cannot tamper with which loan or amount is paid.
 *
 * Authorization: the payToken is the high-entropy bearer secret that gates the
 * order; optionally, if the caller presents a Firebase ID token, we additionally
 * bind the session to the loan owner (or an admin).
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
    description?: unknown;
    returnUrl?: unknown;
    customer?: unknown;
    metadata?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!ORDER_ID_RE.test(orderId)) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

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
    if (data.emiEligible !== true) {
      return NextResponse.json(
        { error: "EMI payment is not enabled for this loan." },
        { status: 403 },
      );
    }

    // Optional but enforced identity binding when a Firebase token is supplied.
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (idToken) {
      let decoded: { uid?: string; email?: string } | null = null;
      try {
        decoded = await adminAuth().verifyIdToken(idToken);
      } catch {
        return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
      }
      const isAdmin = decoded?.email != null && (await isAdminEmail(decoded.email));
      // Loan-backed payments bind to the borrower; standalone EMI records (no
      // application) have no owner — the unguessable orderId is the credential.
      const isOwner = decoded?.uid != null && !!data.uid && data.uid === decoded.uid;
      const isStandalone = !data.uid;
      if (!isStandalone && !isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "You are not authorized to pay this loan." },
          { status: 403 },
        );
      }
    }

    // Use the EXACT stored EMI amount (paise-preserving) so it reconciles with
    // verifyYoupiPayment's 0.01 tolerance and never overcharges the customer.
    const emiAmount = Number(data.emiAmount);
    if (!Number.isFinite(emiAmount) || emiAmount <= 0) {
      return NextResponse.json(
        { error: "No EMI amount has been configured for this loan." },
        { status: 409 },
      );
    }

    const session = await createYoupiSession({
      orderId,
      amount: emiAmount,
      description,
      returnUrl,
      customer,
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

/** Returns true when the given email is a provisioned admin (staff roster). */
async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const staffDoc = await adminDb().collection("staff").doc(email.toLowerCase()).get();
    return staffDoc.exists && staffDoc.data()?.role === "admin";
  } catch {
    return false;
  }
}
