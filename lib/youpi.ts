import "server-only";

/**
 * YOUPI PG (self-hosted UPI payment gateway) — server-side integration.
 *
 * This module is server-only. It holds the merchant API key and creates
 * payment sessions on behalf of the Financily app. The browser never sees the
 * merchant key — it only receives a `checkoutUrl` to open in the YouPI modal.
 *
 * YouPI is an experimental, self-hosted gateway. When not configured, the
 * API route reports a friendly "not configured" state so the UI degrades
 * gracefully (mirroring the Firebase "not configured" behaviour).
 */

export interface YoupiCustomer {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateYoupiSessionInput {
  orderId: string;
  amount: number; // in INR
  description?: string;
  customer?: YoupiCustomer;
  returnUrl?: string;
  metadata?: Record<string, string>;
}

export interface YoupiSession {
  paymentId: string;
  orderId: string;
  amount: string;
  status: string;
  checkoutUrl: string;
}

export interface VerifyYoupiOrderInput {
  orderId: string;
  paymentId?: string;
  /** Expected amount in INR, cross-checked against the gateway's record. */
  amount?: number;
}

export interface YoupiVerificationResult {
  orderId: string;
  paymentId?: string;
  /** true only when the gateway itself reports a paid settlement status. */
  confirmed: boolean;
  status: string;
  amountMatch: boolean;
}

export type YoupiSessionStatus =
  | "configured"
  | "not-configured";

export function youpiConfigured(): boolean {
  return Boolean(
    process.env.YOUPI_API_URL &&
      process.env.YOUPI_MERCHANT_ID &&
      process.env.YOUPI_MERCHANT_API_KEY,
  );
}

function getConfig() {
  return {
    apiUrl: (process.env.YOUPI_API_URL || "").replace(/\/+$/, ""),
    merchantId: process.env.YOUPI_MERCHANT_ID || "",
    apiKey: process.env.YOUPI_MERCHANT_API_KEY || "",
  };
}

/**
 * Create a YouPI payment session. Returns a checkout URL that the browser can
 * load inside the YouPI checkout modal (iframe) or a standalone window.
 */
export async function createYoupiSession(
  input: CreateYoupiSessionInput,
): Promise<YoupiSession> {
  if (!youpiConfigured()) {
    throw new Error(
      "YouPI payment gateway is not configured. Add YOUPI_API_URL, YOUPI_MERCHANT_ID and YOUPI_MERCHANT_API_KEY environment variables.",
    );
  }

  const cfg = getConfig();
  const amountStr = input.amount.toFixed(2);

  const res = await fetch(`${cfg.apiUrl}/api/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Merchant-Id": cfg.merchantId,
      "X-Merchant-Key": cfg.apiKey,
      // Idempotency: an order should never create two live sessions.
      "Idempotency-Key": `financily:${input.orderId}`,
    },
    body: JSON.stringify({
      orderId: input.orderId,
      amount: amountStr,
      currency: "INR",
      description: input.description || "Financily payment",
      customer: input.customer,
      returnUrl: input.returnUrl,
      metadata: {
        source: "financily",
        ...input.metadata,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `YouPI session creation failed (${res.status}): ${data?.error || data?.message || "unknown error"}`,
    );
  }

  if (!data.checkoutUrl || !data.paymentId) {
    throw new Error("YouPI returned an invalid session payload.");
  }

  return {
    paymentId: data.paymentId,
    orderId: data.orderId || input.orderId,
    amount: data.amount || amountStr,
    status: data.status || "INITIATED",
    checkoutUrl: data.checkoutUrl,
  };
}

/**
 * Server-side verification of a YouPI order's payment status.
 *
 * IMPORTANT: The browser-side `youpi:payment:success` event is a UI hint only
 * and is spoofable. We therefore never trust it. This function asks the YouPI
 * gateway directly (authenticated with the merchant API key) for the actual
 * payment status, and only reports `confirmed: true` when the gateway itself
 * returns a settled/paid status (SUCCESS, OBSERVED_SUCCESS or RECONCILED).
 */
export async function verifyYoupiOrder(
  input: VerifyYoupiOrderInput,
): Promise<YoupiVerificationResult> {
  if (!youpiConfigured()) {
    throw new Error(
      "YouPI payment gateway is not configured. Add YOUPI_API_URL, YOUPI_MERCHANT_ID and YOUPI_MERCHANT_API_KEY environment variables.",
    );
  }

  const cfg = getConfig();
  const paymentId = input.paymentId || input.orderId;

  const res = await fetch(
    `${cfg.apiUrl}/api/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Merchant-Id": cfg.merchantId,
        "X-Merchant-Key": cfg.apiKey,
      },
    },
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `YouPI verification failed (${res.status}): ${data?.error || data?.message || "unknown error"}`,
    );
  }

  const status: string = String(
    data?.status || data?.paymentStatus || "",
  ).toUpperCase();
  const settledStatuses = ["SUCCESS", "OBSERVED_SUCCESS", "RECONCILED"];
  const settled = settledStatuses.includes(status);

  // Order identity cross-check — never fall back silently via `||`. If the
  // gateway returns an orderId/paymentId, it MUST match the requested order,
  // otherwise we treat the response as not belonging to this verification.
  const returnedOrderId = data?.orderId ? String(data.orderId) : "";
  const returnedPaymentId = data?.paymentId ? String(data.paymentId) : "";
  const orderMatches = !returnedOrderId || returnedOrderId === input.orderId;
  const paymentMatches =
    !input.paymentId || !returnedPaymentId || returnedPaymentId === input.paymentId;

  // Fail-closed amount check: if the caller expects an amount, we require the
  // gateway to report an explicit, matching amount. If the gateway omits the
  // amount (or returns a non-numeric value), amountMatch stays false and the
  // payment is NOT confirmed — a compromised/partial gateway cannot pass a
  // lesser amount.
  let amountMatch = false;
  if (typeof input.amount === "number" && Number.isFinite(input.amount)) {
    const rawAmount = data?.amount ?? data?.amountPaise;
    const parsed =
      typeof rawAmount === "number" ? rawAmount : Number.parseFloat(rawAmount);
    if (Number.isFinite(parsed) && parsed > 0) {
      amountMatch = Math.abs(parsed - input.amount) < 0.01;
    }
  }

  const confirmed = settled && orderMatches && paymentMatches && amountMatch;

  return {
    orderId: returnedOrderId || input.orderId,
    paymentId: returnedPaymentId || input.paymentId,
    confirmed,
    status,
    amountMatch,
  };
}
