/**
 * Pure, DOM-free helpers for building the YouPI checkout script <script>
 * attributes. Kept separate from `lib/youpiClient.ts` so the behavior is
 * unit-testable without a DOM and without loading Firebase/browser code.
 */

export interface YoupiScriptAttrs {
  /** Absolute URL of the SDK script, e.g. http://localhost:7000/youpi.js */
  src: string;
  /** `data-youpi-key` attribute (publishable merchant id on this stack). */
  dataYoupiKey: string;
  /** `data-merchant-id` attribute — the identifier the YouPI SDK reads. */
  dataMerchantId: string;
  /** `data-currency` attribute. */
  dataCurrency: string;
}

/** Build the script attributes for a checkout host + publishable key. */
export function youpiScriptAttrs(
  checkoutUrl: string,
  publicKey: string,
): YoupiScriptAttrs {
  const base = (checkoutUrl || "").replace(/\/+$/, "");
  return {
    src: `${base}/youpi.js`,
    dataYoupiKey: publicKey,
    dataMerchantId: publicKey,
    dataCurrency: "INR",
  };
}
