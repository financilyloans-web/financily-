"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import {
  payWithYoupi,
  youpiClientConfigured,
  onYoupiEvent,
  type YoupiPaymentResult,
} from "@/lib/youpiClient";
import { cn } from "@/lib/utils";

type Status = "idle" | "resolving" | "ready" | "loading" | "success" | "error";
interface NavState {
  status: Status;
  error?: string;
  orderId?: string;
  amount?: number;
}

async function verifyPayment(orderId: string, paymentId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/payments/youpi-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentId }),
    });
    const data = await res.json().catch(() => ({}));
    return !!res.ok && data.confirmed === true;
  } catch {
    return false;
  }
}

export function NavPayButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [state, setState] = useState<NavState>({ status: "idle" });
  const configured = youpiClientConfigured();
  const orderIdRef = useRef("");

  // Listen for YouPI gateway events for the whole open session.
  useEffect(() => {
    if (!open) return;
    const unsub = onYoupiEvent((detail: YoupiPaymentResult) => {
      if (detail.status === "SUCCESS") {
        setState((s) => ({ ...s, status: "loading" }));
        const orderId = orderIdRef.current;
        if (!orderId) return;
        // Verify THIS transaction: use the gateway's own transaction id from the
        // event (detail.order_id), NOT the loan order id. Passing the order id as
        // the paymentId could match a stale/previous payment on the same order and
        // falsely confirm a payment that never settled for this attempt.
        const paymentId = detail.order_id || orderId;
        (async () => {
          const confirmed = await verifyPayment(orderId, paymentId);
          setState(
            confirmed
              ? { status: "success" }
              : {
                  status: "error",
                  error:
                    "We're still confirming your payment with the bank. Please check back shortly.",
                },
          );
        })();
      } else if (detail.status === "FAILED" || detail.status === "SUSPICIOUS") {
        setState({ status: "error", error: `Payment was ${detail.status.toLowerCase()}. You can retry.` });
      } else if (detail.status === "EXPIRED") {
        setState({ status: "error", error: "Payment window expired. Please retry." });
      } else if (detail.status === "CANCELLED") {
        setState((s) => (s.status === "loading" ? { status: "ready", orderId: s.orderId, amount: s.amount } : s));
      }
    });
    return unsub;
  }, [open]);

  const close = () => {
    setOpen(false);
    setInput("");
    setState({ status: "idle" });
  };

  const resolve = async () => {
    const mobile = input.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setState({ status: "error", error: "Please enter a valid 10-digit mobile number." });
      return;
    }
    setState({ status: "resolving" });
    try {
      const res = await fetch(`/api/payments/youpi-order?mobile=${encodeURIComponent(mobile)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", error: data?.error || "No EMI payment is enabled for this number." });
        return;
      }
      orderIdRef.current = data.orderId;
      setState({ status: "ready", orderId: data.orderId, amount: data.amount });
    } catch (e: any) {
      setState({ status: "error", error: e?.message || "Could not resolve your EMI payment." });
    }
  };

  const startPayment = async () => {
    if (state.status !== "ready" || !state.amount) return;
    if (!configured) {
      setState({ status: "error", error: "Payment gateway is not configured yet." });
      return;
    }
    const orderId = orderIdRef.current;
    const amount = state.amount;
    setState({ status: "loading", orderId, amount });
    try {
      await payWithYoupi({
        orderId,
        amount,
        description: `EMI payment (${orderId})`,
        metadata: { source: "financily-nav-pay" },
        handler: (r) => {
          // eslint-disable-next-line no-console
          console.log(`YouPI checkout status: ${r.status}`);
        },
        onClose: () => setState({ status: "ready", orderId, amount }),
      });
      setState({ status: "ready", orderId, amount });
    } catch (e: any) {
      setState({ status: "error", error: e?.message || "Could not start payment." });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white",
          className,
        )}
      >
        <CreditCard className="h-4 w-4 text-cyan-300" />
        <span className="hidden sm:inline">Pay EMI</span>
      </button>

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
              className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-7"
              initial={{ y: 24, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-label="Pay your EMI"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-primary-500 text-white shadow-lg">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display font-bold text-white">Pay your EMI</p>
                    <p className="text-xs text-slate-400">Powered by YouPI · UPI</p>
                  </div>
                </div>
                <button onClick={close} className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {state.status === "success" ? (
                <div className="mt-8 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <p className="mt-4 font-display text-lg font-bold text-white">Payment confirmed</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Your EMI payment was successful. A receipt is with your lender.
                  </p>
                  <button onClick={close} className="btn-primary mt-6 w-full">Done</button>
                </div>
              ) : (
                <>
                  <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-xs text-cyan-200">
                    <span className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      No account needed — enter the mobile number registered on your
                      loan and pay via UPI. Funds go straight to your lender.
                    </span>
                  </div>

                  {state.status === "idle" || state.status === "resolving" ? (
                    <div className="mt-5">
                      <label className="text-sm font-medium text-slate-300">Mobile number</label>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-400">
                          <KeyRound className="h-5 w-5" />
                        </span>
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && resolve()}
                          placeholder="10-digit mobile number"
                          className="input-glass flex-1"
                        />
                      </div>
                      <button onClick={resolve} disabled={state.status === "resolving" || !input.trim()} className="btn-primary mt-4 w-full">
                        {state.status === "resolving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        {state.status === "resolving" ? "Checking order…" : "Continue"}
                      </button>
                    </div>
                  ) : null}

                  {(state.status === "ready" || state.status === "loading") && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                        <span className="text-sm text-slate-300">Amount due</span>
                        <span className="text-gradient font-display text-2xl font-bold">
                          ₹{state.amount?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <button onClick={startPayment} className="btn-primary mt-4 w-full">
                        {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                        {state.status === "loading" ? "Opening checkout…" : "Pay via UPI"}
                      </button>
                      <button onClick={() => setState({ status: "idle" })} className="mt-3 w-full text-center text-sm text-slate-400 hover:text-white">
                        Use a different mobile number
                      </button>
                    </div>
                  )}

                  {state.status === "error" && (
                    <div className="mt-5">
                      <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{state.error}</span>
                      </div>
                      <button onClick={() => setState({ status: "idle" })} className="btn-ghost mt-4 w-full">
                        Try again
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
