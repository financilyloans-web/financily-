"use client";

import { useState } from "react";
import { Loader2, Phone, IndianRupee, ShieldCheck, Search, CheckCircle2, AlertTriangle, UserCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn, safeJson } from "@/lib/utils";

interface AppRow {
  id: string;
  uid: string;
  fullName: string;
  status: string;
  loanAmount: number | null;
  emiEligible: boolean;
  emiAmount: number | null;
}

const MOBILE_RE = /^[6-9]\d{9}$/;

export function EmiPaymentsPanel() {
  const { user } = useAuth();
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [eligible, setEligible] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [apps, setApps] = useState<AppRow[] | null>(null);

  const idToken = async () => (await user?.getIdToken(true)) || "";

  const lookup = async () => {
    if (!MOBILE_RE.test(mobile)) {
      setMessage({ ok: false, text: "Enter a valid 10-digit mobile number." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/emi?mobile=${encodeURIComponent(mobile)}`, {
        headers: { authorization: `Bearer ${await idToken()}` },
      });
      const data = await safeJson<{ error?: string; applications?: AppRow[] }>(res);
      if (!data) throw new Error("Lookup failed.");
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      setApps(data.applications || []);
      if ((data.applications || []).length === 0) {
        setMessage({ ok: false, text: "No loan applications found for this mobile number." });
      }
    } catch (e: any) {
      setApps([]);
      setMessage({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!MOBILE_RE.test(mobile)) {
      setMessage({ ok: false, text: "Enter a valid 10-digit mobile number." });
      return;
    }
    const amt = Number(amount);
    if (eligible && (!Number.isFinite(amt) || amt <= 0)) {
      setMessage({ ok: false, text: "Enter a valid EMI amount." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/emi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${await idToken()}`,
        },
        body: JSON.stringify({ mobile, amount: amt, eligible }),
      });
      const data = await safeJson<{ error?: string; eligible?: boolean; updated?: number; amount?: number }>(res);
      if (!data) throw new Error("Save failed.");
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setMessage({
        ok: true,
        text: `✔ ${data.eligible ? "Enabled" : "Disabled"} EMI payment for ${data.updated} application(s)${
          data.eligible ? ` · ₹${Number(data.amount).toLocaleString("en-IN")}` : ""
        }.`,
      });
      setApps(null);
    } catch (e: any) {
      setMessage({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass mt-8 rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-cyan-300" />
        <h2 className="font-display text-lg font-bold text-white">EMI payments control</h2>
      </div>
      <p className="mt-1 text-sm text-slate-400">
        Decide which mobile number can pay and exactly how much. Applies to every
        active loan registered on that number.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Enter mobile number"
            inputMode="numeric"
            className="input-glass pl-10"
          />
        </div>
        <div className="relative">
          <IndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="EMI amount (₹)"
            inputMode="numeric"
            className="input-glass pl-10"
            disabled={!eligible}
          />
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={lookup} disabled={busy} className="btn-ghost px-4 py-2.5 text-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Look up
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn-primary px-5 py-2.5 text-sm">
            Save
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEligible((v) => !v)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            eligible ? "bg-emerald-400/80" : "bg-white/15",
          )}
          aria-pressed={eligible}
          aria-label="Toggle EMI payment eligibility"
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
              eligible ? "left-[22px]" : "left-0.5",
            )}
          />
        </button>
        <span className="text-sm text-slate-300">
          {eligible ? "Payment enabled for this number" : "Payment disabled for this number"}
        </span>
      </div>

      {message && (
        <div
          className={cn(
            "mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm",
            message.ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-rose-400/30 bg-rose-400/10 text-rose-200",
          )}
        >
          {message.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {apps && apps.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-4 font-medium">Borrower</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Loan amount</th>
                <th className="pb-2 font-medium">EMI payment</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2 text-slate-200">
                      <UserCheck className="h-4 w-4 text-cyan-300" />
                      {a.fullName}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 capitalize text-slate-300">{String(a.status).replace("_", " ")}</td>
                  <td className="py-2.5 pr-4 text-slate-200">
                    ₹{a.loanAmount != null ? Number(a.loanAmount).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="py-2.5">
                    <span className={cn("chip", a.emiEligible ? "text-emerald-300" : "text-slate-400")}>
                      {a.emiEligible ? `Enabled · ₹${Number(a.emiAmount).toLocaleString("en-IN")}` : "Disabled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
