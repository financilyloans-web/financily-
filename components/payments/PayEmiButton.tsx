"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X, CreditCard, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PayEmiButtonProps {
  orderId: string;
  amount: number;
  description?: string;
  customer?: { name?: string; email?: string; phoneNumber?: string };
  returnUrl?: string;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
}

type ModalState = { status: "idle" | "loading" | "ready" | "error"; url?: string; error?: string };

export function PayEmiButton({
  orderId,
  amount,
  description,
  customer,
  returnUrl,
  variant = "primary",
  size = "md",
  className,
}: PayEmiButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ModalState>({ status: "idle" });

  const close = () => {
    setOpen(false);
    setState({ status: "idle" });
  };

  const startPayment = async () => {
    setOpen(true);
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/payments/youpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount, description, customer, returnUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not start payment.");
      }
      if (!data.session?.checkoutUrl) {
        throw new Error("No checkout URL returned.");
      }
      setState({ status: "ready", url: data.session.checkoutUrl });
    } catch (err: any) {
      setState({ status: "error", error: err?.message || "Something went wrong." });
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
        Pay EMI
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="glass-strong w-full max-w-2xl overflow-hidden rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Pay EMI</h3>
                  <p className="text-xs text-slate-400">Order {orderId} · ₹{amount.toLocaleString("en-IN")}</p>
                </div>
                <button
                  onClick={close}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                  aria-label="Close payment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                {state.status === "loading" && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Loader2 className="h-9 w-9 animate-spin text-cyan-300" />
                    <p className="text-sm text-slate-300">Creating secure UPI checkout…</p>
                  </div>
                )}

                {state.status === "ready" && state.url && (
                  <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white">
                    <iframe
                      src={state.url}
                      title="YouPI UPI Checkout"
                      className="h-full w-full"
                      allow="payment"
                    />
                  </div>
                )}

                {state.status === "error" && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/15 text-rose-300">
                      <AlertTriangle className="h-6 w-6" />
                    </span>
                    <p className="max-w-sm text-sm text-rose-300">{state.error}</p>
                    <Button variant="ghost" size="sm" onClick={startPayment}>
                      Try again
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {state.status === "ready" && (
                <div className="flex items-center gap-2 border-t border-white/10 bg-white/5 px-5 py-3 text-[11px] text-slate-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Payment is processed by your UPI app. Financily is not a lender
                    and does not handle funds — settlement is direct to the lender.
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Re-export for convenience so callers can import a single symbol.
export const PayEmiModal = PayEmiButton;
