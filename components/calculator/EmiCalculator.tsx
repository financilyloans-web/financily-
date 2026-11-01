"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, IndianRupee, Percent, CalendarRange } from "lucide-react";
import { computeEmi } from "@/lib/emi";
import { formatINR } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

const SLIDER_STYLE = "h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400";

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 font-display text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export function EmiCalculator() {
  const [principal, setPrincipal] = useState(500000);
  const [annualRate, setAnnualRate] = useState(12);
  const [months, setMonths] = useState(60);

  const result = useMemo(() => computeEmi(principal, annualRate, months), [principal, annualRate, months]);

  const { emi, totalInterest, totalPayment, schedule } = result;

  const chart = useMemo(() => {
    const points = schedule.length ? schedule : [];
    const maxVal = Math.max(totalPayment, 1);
    const W = 600;
    const H = 200;
    const pad = 8;

    const coords = points.map((p, i) => {
      let x = pad + (i / Math.max(points.length - 1, 1)) * (W - pad * 2);
      let yPrev = H - ((p.principalPaid > 0 ? (p.month / points.length) * totalPayment : 0) / maxVal) * (H - pad * 2);
      const yPrincipal = H - (p.balance / maxVal) * (H - pad * 2);
      const yInterest = H - ((totalPayment - p.balance) / maxVal) * (H - pad * 2);
      void yPrev;
      return { x, yPrincipal, yInterest };
    });

    const line = (key: "yPrincipal" | "yInterest") =>
      coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c[key].toFixed(1)}`).join(" ");

    const area = (key: "yPrincipal" | "yInterest") => {
      if (!coords.length) return "";
      const start = `M${coords[0].x.toFixed(1)},${H}`;
      const body = coords.map((c) => `L${c.x.toFixed(1)},${c[key].toFixed(1)}`).join(" ");
      return `${start}${body}L${coords[coords.length - 1].x.toFixed(1)},${H}Z`;
    };

    return { linePrincipal: line("yPrincipal"), lineInterest: line("yInterest"), areaPrincipal: area("yPrincipal"), areaInterest: area("yInterest") };
  }, [schedule, totalPayment]);

  return (
    <GlassCard hover className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-primary-500 text-white shadow-lg">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold text-white">EMI Calculator</h3>
          <p className="text-sm text-slate-400">Estimate your monthly instalment instantly</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-7">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <IndianRupee className="h-4 w-4 text-cyan-300" /> Loan Amount
              </label>
              <span className="font-display font-semibold text-white">{formatINR(principal)}</span>
            </div>
            <input type="range" min={50000} max={5000000} step={10000} value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className={SLIDER_STYLE} />
            <div className="mt-1 flex justify-between text-xs text-slate-500"><span>₹50K</span><span>₹50L</span></div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Percent className="h-4 w-4 text-cyan-300" /> Interest Rate (p.a.)
              </label>
              <span className="font-display font-semibold text-white">{annualRate}%</span>
            </div>
            <input type="range" min={6} max={24} step={0.1} value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className={SLIDER_STYLE} />
            <div className="mt-1 flex justify-between text-xs text-slate-500"><span>6%</span><span>24%</span></div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <CalendarRange className="h-4 w-4 text-cyan-300" /> Tenure
              </label>
              <span className="font-display font-semibold text-white">{months} months</span>
            </div>
            <input type="range" min={6} max={84} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} className={SLIDER_STYLE} />
            <div className="mt-1 flex justify-between text-xs text-slate-500"><span>6m</span><span>84m</span></div>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6">
          <motion.div key={emi} initial={{ scale: 0.96, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}>
            <p className="text-sm text-slate-400">Monthly EMI</p>
            <p className="text-gradient font-display text-4xl font-bold sm:text-5xl">{formatINR(Math.round(emi))}</p>
          </motion.div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Principal" value={formatINR(principal)} tone="text-white" />
            <Stat label="Total Interest" value={formatINR(Math.round(totalInterest))} tone="text-cyan-300" />
            <Stat label="Total Payment" value={formatINR(Math.round(totalPayment))} tone="text-white" />
            <Stat label="Tenure" value={`${months}m`} tone="text-accent-300" />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 p-4">
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-primary-500" /> Principal</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-500 to-fuchsia-400" /> Interest</span>
            </div>
            <svg viewBox="0 0 600 200" className="h-32 w-full sm:h-40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ddcff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#2f6bff" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <path d={chart.areaInterest} fill="url(#gI)" />
              <path d={chart.areaPrincipal} fill="url(#gP)" />
              <path d={chart.lineInterest} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
              <path d={chart.linePrincipal} fill="none" stroke="#3ddcff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
