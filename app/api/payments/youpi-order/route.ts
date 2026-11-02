import { NextRequest, NextResponse } from "next/server";
import {
  MOBILE_RE,
  ORDER_ID_RE,
  resolveEmiLoanByMobile,
  resolveLoanByPayToken,
  ensurePayToken,
} from "@/lib/youpiOrder";

/**
 * GET /api/payments/youpi-order
 *
 * Authoritative order resolution for the YouPI checkout.
 *
 * The orderId is a server-side random bearer token (`EMI-<payToken>`), never a
 * borrower's mobile number. This keeps the public (unauthenticated) endpoint
 * from leaking PII — knowing a phone number alone cannot confirm EMI enablement
 * or amounts. Two lookup modes are supported:
 *   ?mobile=<10-digit>          — public "no account" flow (NavPayButton).
 *   ?orderId=EMI-<payToken>     — dashboard flow (PayEmiButton).
 *
 * An admin must have explicitly enabled EMI payment for the mobile number and
 * set the payable amount (see /api/admin/emi). We return only the minimal data
 * needed to pay (orderId + amount) — no borrower PII (mobile/refNumber) is
 * exposed, and the amount returned is the exact admin-set EMI amount.
 */
export async function GET(req: NextRequest) {
  const mobile = (req.nextUrl.searchParams.get("mobile") || "").trim();
  const orderId = (req.nextUrl.searchParams.get("orderId") || "").trim();

  if (!mobile && !orderId) {
    return NextResponse.json(
      { error: "Provide a mobile number or an orderId." },
      { status: 400 },
    );
  }

  try {
    let loan: Awaited<ReturnType<typeof resolveEmiLoanByMobile>> = null;
    let resolvedOrderId = "";

    if (orderId) {
      if (!ORDER_ID_RE.test(orderId)) {
        return NextResponse.json(
          { error: "A valid orderId is required." },
          { status: 400 },
        );
      }
      loan = await resolveLoanByPayToken(orderId.slice("EMI-".length));
      if (!loan) {
        return NextResponse.json(
          { error: "No active EMI payment is enabled for this loan." },
          { status: 404 },
        );
      }
      resolvedOrderId = orderId;
    } else {
      if (!MOBILE_RE.test(mobile)) {
        return NextResponse.json(
          { error: "A valid 10-digit mobile number is required." },
          { status: 400 },
        );
      }
      loan = await resolveEmiLoanByMobile(mobile);
      if (!loan) {
        return NextResponse.json(
          { error: "No active EMI payment is enabled for this mobile number." },
          { status: 404 },
        );
      }
      const token = await ensurePayToken(loan);
      resolvedOrderId = `EMI-${token}`;
    }

    // Validate the admin-set EMI amount explicitly rather than letting 0 / NaN
    // slip through (mirrors the guard in youpi-verify).
    const rawAmount = Number(loan.data.emiAmount);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "No valid EMI amount is configured for this loan." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      orderId: resolvedOrderId,
      amount: rawAmount,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[payments/youpi-order] error:", err);
    return NextResponse.json({ error: "Could not resolve order." }, { status: 500 });
  }
}
