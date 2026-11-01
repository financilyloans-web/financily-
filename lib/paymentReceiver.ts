/**
 * Payment receiver / beneficiary details shown to the customer before they
 * complete a payment. These are intentionally PUBLIC (include are displayed to
 * the payer so they know exactly where the funds are going).
 *
 * You can override any of these via the corresponding `NEXT_PUBLIC_*`
 * environment variables; otherwise the default Good Life Enterprises account
 * is used.
 */

export interface PaymentReceiver {
  /** Display name of the payee (UPI vPA beneficiary). */
  payeeName: string;
  /** UPI virtual payment address (vPA), e.g. 8269581567-2@ybl. */
  upiId: string;
  /** Beneficiary bank account number. */
  accountNumber: string;
  /** IFSC code of the beneficiary bank. */
  ifsc: string;
  /** Beneficiary bank name. */
  bankName: string;
}

export const PAYMENT_RECEIVER: PaymentReceiver = {
  payeeName:
    process.env.NEXT_PUBLIC_PAYEE_NAME || "Good Life Enterprises",
  upiId:
    process.env.NEXT_PUBLIC_UPI_ID || "8269581567-2@ybl",
  accountNumber:
    process.env.NEXT_PUBLIC_RECEIVER_ACCOUNT || "4508020001131836",
  ifsc:
    process.env.NEXT_PUBLIC_RECEIVER_IFSC || "jsfb0004508",
  bankName:
    process.env.NEXT_PUBLIC_RECEIVER_BANK || "Jana Small Finance Bank",
};

/** A short human-readable string for display, e.g. in the checkout footer. */
export function receiverSummary(recv: PaymentReceiver = PAYMENT_RECEIVER): string {
  return `${recv.payeeName} · UPI ${recv.upiId}`;
}
