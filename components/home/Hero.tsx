"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, CheckCircle2, Sparkles, BadgeCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Counter } from "@/components/effects/Counter";
import { cn } from "@/lib/utils";

const floatingStats = [
  { top: "6%", left: "-6%", label: "₹10L+ disbursed", icon: BadgeCheck },
  { top: "38%", left: "-12%", label: "24hr avg approval", icon: Zap },
  { top: "68%", left: "-6%", label: "700+ lenders", icon: Sparkles },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="section-shell grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-200"
          >
            <Sparkles className="h-4 w-4" />
            India&apos;s trusted digital loan marketplace
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-balance font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
          >
            Get Instant Personal Loans Through{" "}
            <span className="text-gradient">Trusted Lenders</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-300/85"
          >
            Compare offers from approved banks, NBFCs, and lending partners.
            100% online, paperless, and secure. No hidden fees — just the right
            loan for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <ButtonLink href="/apply" size="lg">
              Apply Now
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/eligibility-checker" variant="ghost" size="lg">
              Check Eligibility
            </ButtonLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div>
              <p className="font-display text-2xl font-bold text-white">
                <Counter to={4.8} decimals={1} />★
              </p>
              <p className="text-sm text-slate-400">4.8 rating · 2.3L reviews</p>
            </div>
            <div className="h-9 w-px bg-white/10" />
            <div>
              <p className="font-display text-2xl font-bold text-white">
                <Counter to={700} suffix="+" />
              </p>
              <p className="text-sm text-slate-400">Approved lenders</p>
            </div>
            <div className="h-9 w-px bg-white/10" />
            <div>
              <p className="font-display text-2xl font-bold text-white">
                <Counter to={24} suffix="hrs" />
              </p>
              <p className="text-sm text-slate-400">Avg approval time</p>
            </div>
          </motion.div>
        </div>

        {/* Right — animated approval card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary-500/30 via-transparent to-accent-600/30 blur-2xl" />

          <div className="glass-strong relative overflow-hidden rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-primary-500 text-white shadow-lg">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Personal Loan</p>
                  <p className="text-xs text-slate-400">Pre-approved offer</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approved
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400">Loan Amount</p>
                <p className="text-gradient font-display text-4xl font-bold">₹8,50,000</p>
              </div>
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="url(#ringGrad)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.8, delay: 0.7, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3ddcff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold text-white">100%</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "Interest", v: "10.5%" },
                { k: "Tenure", v: "42 months" },
                { k: "EMI", v: "₹23,842" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-[11px] text-slate-400">{s.k}</p>
                  <p className="mt-0.5 font-display text-sm font-bold text-white">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* floating chips */}
          {floatingStats.map((chip, i) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.2 }}
              className={cn("animate-float absolute z-10 hidden sm:block", chip.top, chip.left)}
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
                <chip.icon className="h-4 w-4 text-cyan-300" />
                {chip.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
