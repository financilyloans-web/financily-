"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Wallet, Info } from "lucide-react";
import { computeEligibility } from "@/lib/eligibility";
import { formatINR, cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";

const SOLIDER_STYLE = "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400";

const bandMeta = {
  excellent: { label: "Excellent — you're highly eligible", color: "text-emerald-300", ring: "stroke-emerald-400" },
  good: { label: "Good — strong eligibility", color: "text-cyan-300", ring: "stroke-cyan-400" },
  fair: { label: "Fair — eligibility may be limited", color: "text-amber-300", ring: "stroke-amber-400" },
  risky: { label: "Risky — approval is unlikely right now", color: "text-rose-300", ring: "stroke-rose-400" },
};

export function EligibilityChecker() {
  const [income, setIncome] = useState(50000);
  const [employment, setEmployment] = useState<"salaried" | "self-employed">("salaried");
  const [cibil, setCibil] = useState(750);
  const [existingEmi, setExistingEmi] = useState(8000);
  const [tenure, setTenure] = useState(48);
  const [rate, setRate] = useState(11.5);

  const result = useMemo(
    () => computeEligibility({ monthlyIncome: income, employmentType: employment, cibilScore: cibil, existingEmi, tenureMonths: tenure, applicableRate: rate }),
    [income, employment, cibil, existingEmi, tenure, rate],
  );

  const meta = bandMeta[result.band];

  // Gauge: map eligible EMI into 0..360 deg
  const maxEmi = Math.max(income * 0.5, 1);
  const fraction = Math.min(1, result.eligibleMonthlyEmi / maxEmi);
  const angle = fraction * 270;
  const circumference = 2 * Math.PI * 54;

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <label className="font-medium text-slate-300">Monthly Income</label>
              <span className="font-display font-semibold text-white">{formatINR(income)}</span>
            </div>
            <input type="range" min={15000} max={300000} step={5000} value={income} onChange={(e) => setIncome(Number(e.target.value))} className={SOLIDER_STYLE} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Employment Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(["salaried", "self-employed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEmployment(t)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                    employment === t
                      ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20",
                  )}
                >
                  {t === "salaried" ? "Salaried" : "Self-employed"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <label className="font-medium text-slate-300">CIBIL / Credit Score</label>
              <span className="font-display font-semibold text-white">{cibil}</span>
            </div>
            <input type="range" min={550} max={900} step={10} value={cibil} onChange={(e) => setCibil(Number(e.target.value))} className={SOLIDER_STYLE} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <label className="font-medium text-slate-300">Existing EMI</label>
                <span className="text-xs text-slate-400">{formatINR(existingEmi)}</span>
              </div>
              <input type="range" min={0} max={50000} step={1000} value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))} className={SOLIDER_STYLE} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <label className="font-medium text-slate-300">Tenure</label>
                <span className="text-xs text-slate-400">{tenure}m</span>
              </div>
              <input type="range" min={12} max={84} step={6} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className={SOLIDER_STYLE} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-slate-400">
            <Info className="mr-1.5 inline h-4 w-4 text-cyan-300" />
            This is an indicative, real-time estimate based on typical lender FOIR
            norms. Final eligibility is always determined by the lender.
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Gauge className="h-5 w-5 text-cyan-300" /> Eligibility Estimate
            </p>
            <span className={cn("text-sm font-semibold", meta.color)}>{result.scoreLabel}</span>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="url(#eligGrad)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - fraction) }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="eligGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3ddcff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-xs text-slate-400">Eligible up to</p>
                  <p className="text-gradient font-display text-xl font-bold leading-tight">
                    {formatINR(result.maxLoanAmountRounded)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] text-slate-400">Max EMI</p>
              <p className="mt-1 font-display text-sm font-bold text-white">{formatINR(Math.round(result.eligibleMonthlyEmi))}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] text-slate-400">Rate</p>
              <p className="mt-1 font-display text-sm font-bold text-white">{rate}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] text-slate-400">Tenure</p>
              <p className="mt-1 font-display text-sm font-bold text-white">{tenure}m</p>
            </div>
          </div>

          <div className={cn("mt-4 rounded-2xl border px-4 py-3 text-center text-sm font-medium", meta.color, "border-current/20 bg-current/5")}>
            {meta.label}
          </div>

          <ButtonLink href="/apply" className="mt-5 w-full" size="lg">
            <Wallet className="h-5 w-5" />
            Apply with this estimate
          </ButtonLink>
        </div>
      </div>
    </GlassCard>
  );
}
