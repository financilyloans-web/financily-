"use client";

/**
 * YOUPI PG — Universal client-side integration (one-script, programmatic API).
 *
 * The YouPI universal script (youpi.js) is loaded from the self-hosted checkout
 * host and exposes a global `Youpi` object with a `pay()` method that opens a
 * responsive native modal (deep-linking into the customer's UPI app). This is
 * the documented integration path for React / Next.js SPAs.
 *
 * The merchant PUBLIC key is safe in the browser. The merchant API key / webhook
 * secret remain server-only (see lib/youpi.ts).
 *
 * Configuration (client-safe env):
 *   NEXT_PUBLIC_YOUPI_CHECKOUT_URL  — e.g. https://pay.yourdomain.com
 *   NEXT_PUBLIC_YOUPI_PUBLIC_KEY    — merchant public key
 */

export interface YoupiCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

export interface YoupiPayOptions {
  orderId: string;
  amount: number; // in rupees (whole units, e.g. 499)
  currency?: string;
  /** Merchant display name shown in the checkout (defaults to "Financily"). */
  name?: string;
  description?: string;
  customer?: YoupiCustomer;
  metadata?: Record<string, unknown>;
  handler?: (response: YoupiPaymentResult) => void;
  onClose?: () => void;
}

export interface YoupiPaymentResult {
  status: "SUCCESS" | "FAILED" | "SUSPICIOUS" | "EXPIRED" | "CANCELLED";
  order_id?: string;
  amount_received?: number;
  payment_mode?: string;
  utr?: string;
  timestamp?: string;
  metadata?: unknown;
}

interface YoupiGlobal {
  pay: (options: {
    order_id: string;
    amount: number;
    currency: string;
    /** Merchant display name shown in the checkout (e.g. "Financily"). */
    name?: string;
    /** Line-item / order description shown in the checkout. */
    description?: string;
    customer?: { name?: string; email?: string; phone?: string };
    metadata?: Record<string, unknown>;
    handler?: (response: YoupiPaymentResult) => void;
    onClose?: () => void;
  }) => void;
}

declare global {
  interface Window {
    Youpi?: YoupiGlobal;
  }
}

const SCRIPT_ID = "youpi-universal";

export function youpiClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_YOUPI_CHECKOUT_URL &&
      process.env.NEXT_PUBLIC_YOUPI_PUBLIC_KEY,
  );
}

let loadPromise: Promise<YoupiGlobal> | null = null;

/**
 * Trusted-origin pinning. Only an https checkout URL (or localhost during
 * development) is accepted. Prevents a misconfigured/compromised `http` URL
 * from loading untrusted script into the merchant page.
 */
function isTrustedCheckoutOrigin(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") {
      return u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
    }
    return true;
  } catch {
    return false;
  }
}

function injectScript(): Promise<YoupiGlobal> {
  const checkoutUrl = process.env.NEXT_PUBLIC_YOUPI_CHECKOUT_URL;
  const publicKey = process.env.NEXT_PUBLIC_YOUPI_PUBLIC_KEY;
  const integrity = process.env.NEXT_PUBLIC_YOUPI_SCRIPT_INTEGRITY;

  if (!checkoutUrl || !publicKey) {
    return Promise.reject(
      new Error(
        "YouPI payment gateway is not configured. Add NEXT_PUBLIC_YOUPI_CHECKOUT_URL and NEXT_PUBLIC_YOUPI_PUBLIC_KEY.",
      ),
    );
  }

  if (!isTrustedCheckoutOrigin(checkoutUrl)) {
    return Promise.reject(
      new Error(
        "YouPI checkout URL must be https (or localhost), and is not trusted.",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("YouPI loader can only run in the browser."));
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      const poll = () => {
        if (window.Youpi) resolve(window.Youpi);
        else setTimeout(poll, 40);
      };
      poll();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${checkoutUrl.replace(/\/$/, "")}/youpi.js`;
    script.setAttribute("data-youpi-key", publicKey);
    script.setAttribute("data-currency", "INR");
    script.async = true;

    // Subresource Integrity (SRI) pinning when a hash is configured. Requires
    // crossorigin="anonymous" for the hash to take effect.
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = "anonymous";
    }

    script.onload = () => {
      const poll = () => {
        if (window.Youpi) resolve(window.Youpi);
        else setTimeout(poll, 40);
      };
      poll();
    };
    script.onerror = () =>
      reject(new Error("Failed to load the YouPI checkout script."));

    document.head.appendChild(script);
  });
}

export function loadYoupi(): Promise<YoupiGlobal> {
  if (!loadPromise) loadPromise = injectScript();
  return loadPromise;
}

export async function payWithYoupi(options: YoupiPayOptions): Promise<void> {
  const youpi = await loadYoupi();
  youpi.pay({
    order_id: options.orderId,
    amount: options.amount,
    currency: options.currency || "INR",
    // Top-level merchant + line-item fields as documented by the YouPI API.
    name: options.name || "Financily",
    description: options.description,
    customer: options.customer,
    metadata: options.metadata,
    handler: options.handler,
    onClose: options.onClose,
  });
}

/** Subscribe to normalized YouPI window events. Returns an unsubscribe fn. */
export function onYoupiEvent(
  fn: (detail: YoupiPaymentResult) => void,
): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<YoupiPaymentResult>).detail;
    if (detail) fn(detail);
  };
  const names = [
    "youpi:payment:success",
    "youpi:payment:failed",
    "youpi:payment:suspicious",
    "youpi:payment:expired",
    "youpi:payment:cancelled",
    "youpi:payment:result",
  ];
  names.forEach((n) => window.addEventListener(n, handler as EventListener));
  return () =>
    names.forEach((n) => window.removeEventListener(n, handler as EventListener));
}
