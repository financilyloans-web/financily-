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
      Authorization: `Bearer ${cfg.apiKey}`,
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
