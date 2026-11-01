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

/** Expected base64-decoded byte length for each supported SRI algorithm. */
const INTEGRITY_BYTES: Record<string, number> = {
  sha256: 32,
  sha384: 48,
  sha512: 64,
};

/**
 * Validate a Subresource Integrity hash. Supported algorithms: sha256, sha384,
 * sha512. The hash must be a real base64 digest of the expected length for the
 * declared algorithm. Placeholder strings (e.g. `sha384-EXAMPLE`) are rejected,
 * so a template value can never make the gateway appear configured.
 */
function isValidIntegrity(integrity: string | undefined): boolean {
  if (!integrity) return false;
  const trimmed = integrity.trim();

  // Reject obvious placeholders before any decoding.
  if (/EXAMPLE|PLACEHOLDER|YOUR|CHANGE|KEEP/i.test(trimmed)) return false;

  const m = /^(sha256|sha384|sha512)-([A-Za-z0-9+/=]+)$/.exec(trimmed);
  if (!m) return false;

  const algo = m[1];
  const b64 = m[2];
  const expectedBytes = INTEGRITY_BYTES[algo];

  let decodedBytes = -1;
  try {
    decodedBytes = atob(b64).length;
  } catch {
    return false;
  }

  return decodedBytes === expectedBytes;
}

/**
 * Basic gateway configuration check: checkout URL + public key present.
 *
 * NOTE: this intentionally does NOT require the SRI hash. A deployment that has
 * valid gateway credentials but no pinned hash should still show the Pay button
 * and get a clear, specific error at load time (see injectScript) — rather than
 * being silently disabled. The actual script load remains fail-closed on the
 * integrity hash.
 */
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

  // Fail closed: the checkout script is never loaded unless a valid SRI hash
  // is pinned. Without a trusted hash we cannot guarantee the script loaded is
  // the one we expect, so we refuse to run any checkout code.
  if (!checkoutUrl || !publicKey) {
    return Promise.reject(
      new Error(
        "YouPI payment gateway is not configured. Add NEXT_PUBLIC_YOUPI_CHECKOUT_URL, NEXT_PUBLIC_YOUPI_PUBLIC_KEY and NEXT_PUBLIC_YOUPI_SCRIPT_INTEGRITY.",
      ),
    );
  }

  if (!isValidIntegrity(integrity)) {
    return Promise.reject(
      new Error(
        "YouPI checkout script is missing a valid SRI integrity hash (NEXT_PUBLIC_YOUPI_SCRIPT_INTEGRITY). Refusing to load an unpinned script.",
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

    // SRI is mandatory and validated above. crossorigin="anonymous" is required
    // for the integrity hash to be enforced by the browser.
    script.integrity = integrity!.trim();
    script.crossOrigin = "anonymous";

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
