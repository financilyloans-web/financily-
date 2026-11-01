"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X, CreditCard, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PAYMENT_RECEIVER } from "@/lib/paymentReceiver";
import {
  payWithYoupi,
  youpiClientConfigured,
  onYoupiEvent,
  type YoupiPaymentResult,
} from "@/lib/youpiClient";

interface PayEmiButtonProps {
  orderId: string;
  amount: number;
  description?: string;
  customer?: { name?: string; email?: string; phoneNumber?: string };
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
}

type ModalState = {
  status: "idle" | "loading" | "ready" | "error" | "success";
  error?: string;
};

export function PayEmiButton({
  orderId,
  amount,
  description,
  customer,
  variant = "primary",
  size = "md",
  className,
}: PayEmiButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ModalState>({ status: "idle" });
  const [configured] = useState(() => youpiClientConfigured());

  useEffect(() => {
    if (!open) return;
    const unsubscribe = onYoupiEvent((detail: YoupiPaymentResult) => {
      if (detail.status === "SUCCESS") {
        setState({ status: "success" });
      } else if (detail.status === "FAILED" || detail.status === "SUSPICIOUS") {
        setState({ status: "error", error: `Payment was ${detail.status.toLowerCase()}. You can retry.` });
      } else if (detail.status === "EXPIRED") {
        setState({ status: "error", error: "Payment window expired. Please retry." });
      } else if (detail.status === "CANCELLED") {
        close();
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    setState({ status: "idle" });
  };

  const startPayment = async () => {
    setOpen(true);
    if (!configured) {
      setState({
        status: "error",
        error: "Payment gateway is not configured yet.",
      });
      return;
    }
    setState({ status: "loading" });
    try {
      await payWithYoupi({
        orderId,
        amount,
        description,
        customer: customer
          ? { name: customer.name, email: customer.email, phone: customer.phoneNumber }
          : undefined,
        metadata: { source: "financily-pay-emi" },
        onClose: () => {
          setState((s) => (s.status === "loading" ? { status: "idle" } : s));
        },
      });
      // Native YouPI modal is now open; keep the dialog as a status panel.
      setState((s) => (s.status === "loading" ? { status: "ready" } : s));
    } catch (err: any) {
      setState({ status: "error", error: err?.message || "Could not start payment." });
    }
  };

  const disabled = open && state.status === "loading";

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={startPayment}
        disabled={disabled}
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {disabled ? "Opening checkout…" : "Pay EMI"}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={close} />

            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Pay EMI</h3>
                  <p className="text-xs text-slate-400">
                    Order {orderId} · ₹{amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={close}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                  aria-label="Close payment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Receiver details */}
              <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Paying to
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                  <span className="font-semibold text-white">{PAYMENT_RECEIVER.payeeName}</span>
                  <span className="text-slate-300">UPI {PAYMENT_RECEIVER.upiId}</span>
                  <span className="text-slate-400">{PAYMENT_RECEIVER.bankName}</span>
                </div>
              </div>

              <div className="p-6">
                {state.status === "loading" && (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <Loader2 className="h-9 w-9 animate-spin text-cyan-300" />
                    <p className="text-sm text-slate-300">
                      Opening secure UPI checkout… Complete the payment in the window that opens.
                    </p>
                  </div>
                )}

                {state.status === "ready" && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <p className="text-sm text-slate-300">
                      Payment window is open. Complete it in your UPI app, then come
                      back here — we&apos;ll confirm the status instantly.
                    </p>
                  </div>
                )}

                {state.status === "success" && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                      <CheckCircle2 className="h-6 w-6" />
                    </span>
                    <p className="text-base font-semibold text-white">Payment received</p>
                    <p className="text-sm text-slate-300">
                      We&apos;re verifying with the bank. Your EMI will be updated shortly.
                    </p>
                    <Button variant="ghost" size="sm" onClick={close} className="mt-2">
                      Done
                    </Button>
                  </div>
                )}

                {state.status === "error" && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/15 text-rose-300">
                      <AlertTriangle className="h-6 w-6" />
                    </span>
                    <p className="max-w-sm text-sm text-rose-300">{state.error}</p>
                    <Button variant="ghost" size="sm" onClick={startPayment}>
                      Try again
                    </Button>
                  </div>
                )}

                {state.status === "idle" && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <Button className="w-full" onClick={startPayment}>
                      {configured ? "Proceed to pay" : "Retry"}
                    </Button>
                    <p className="text-center text-[11px] text-slate-500">
                      Payment is processed by your UPI app via YouPI. Financily is not a
                      lender and does not handle funds — settlement is direct to the payee.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={cn("border-t border-white/10 bg-white/5 px-5 py-3")}>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10.5px] text-slate-500">
                  <span>Before paying, verify the beneficiary:</span>
                  <span className="text-slate-300">{PAYMENT_RECEIVER.payeeName}</span>
                  <span>UPI {PAYMENT_RECEIVER.upiId}</span>
                  <span>A/c {PAYMENT_RECEIVER.accountNumber}</span>
                  <span>IFSC {PAYMENT_RECEIVER.ifsc}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Re-export for convenience so callers can import a single symbol.
export const PayEmiModal = PayEmiButton;
