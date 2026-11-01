import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileText, Sparkles, ShieldCheck, Zap, Building2, Percent, Clock } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Personal Loan",
  description:
    "Compare instant personal loan offers from approved banks, NBFCs and lending partners. 100% online application with quick disbursal.",
};

const highlights = [
  { icon: Zap, title: "Instant pre-approval", desc: "See personalized offers within minutes." },
  { icon: Percent, title: "Rates from 8.5% p.a.", desc: "Competitive interest from multiple lenders." },
  { icon: Clock, title: "Disbursal in 24–72 hrs", desc: "Funds credited straight to your account." },
  { icon: ShieldCheck, title: "Secure & DPDP compliant", desc: "Your data is encrypted and protected." },
];

const rates = [
  { lender: "HDFC Bank", rate: "10.50%", fee: "0–1.5%", tenure: "Up to 60 months" },
  { lender: "ICICI Bank", rate: "10.75%", fee: "0.50–1%", tenure: "Up to 60 months" },
  { lender: "Bajaj Finserv", rate: "13.00%", fee: "1.25%", tenure: "Up to 84 months" },
  { lender: "Tata Capital", rate: "11.25%", fee: "0.75%", tenure: "Up to 72 months" },
  { lender: "Axis Bank", rate: "10.80%", fee: "0–1%", tenure: "Up to 60 months" },
];

const docs = ["PAN Card", "Aadhaar Card", "Bank statement (3–6 months)", "Salary slips / ITR"];

const steps = ["Check eligibility", "Compare offers", "Submit documents", "Get disbursed"];

export default function PersonalLoanPage() {
  return (
    <>
      <PageHero
        eyebrow="Personal Loan"
        title={<span>Personal loans made <span className="text-gradient">simple &amp; fast</span></span>}
        description="Borrow up to ₹50 lakh without collateral, with interest rates starting at 8.5% p.a. Compare and apply across multiple approved lenders in one place."
      />

      <section className="section-shell py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.06}>
              <GlassCard hover className="h-full p-5">
                <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-primary-500 text-white shadow-lg">
                  <h.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">{h.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{h.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/apply" size="lg">
            Apply for a Personal Loan
            <ArrowRight className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink href="/eligibility-checker" variant="ghost" size="lg">
            Check Eligibility First
          </ButtonLink>
        </div>
      </section>

      <section className="section-shell py-14">
        <SectionHeading title="Representative offers from partner lenders" description="Rates and terms shown are indicative and subject to lender approval based on your profile." />
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <div className="hidden grid-cols-4 gap-4 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-300 md:grid">
            <span>Lender</span><span>Interest Rate</span><span>Processing Fee</span><span>Tenure</span>
          </div>
          {rates.map((r, i) => (
            <div key={r.lender} className="grid grid-cols-2 gap-2 border-t border-white/10 px-6 py-5 transition-colors hover:bg-white/5 md:grid-cols-4 md:gap-4">
              <span className="flex items-center gap-2 font-semibold text-white"><Building2 className="hidden h-4 w-4 text-cyan-300 md:block" />{r.lender}</span>
              <span className="font-display font-bold text-cyan-300">{r.rate}</span>
              <span className="text-slate-300">{r.fee}</span>
              <span className="text-slate-300">{r.tenure}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Financily is a marketplace — not a lender. All approvals are decided by partner lenders.
        </p>
      </section>

      <section className="section-shell grid gap-8 py-14 lg:grid-cols-2">
        <Reveal>
          <GlassCard className="h-full p-7">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <FileText className="h-5 w-5 text-cyan-300" /> Minimal documents, fully paperless
            </h3>
            <ul className="mt-5 space-y-3">
              {docs.map((d) => (
                <li key={d} className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />{d}
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>
        <Reveal delay={0.1}>
          <GlassCard className="h-full p-7">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <Sparkles className="h-5 w-5 text-cyan-300" /> Your journey in 4 steps
            </h3>
            <ol className="mt-5 space-y-4">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 font-display text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-slate-200">{s}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href="/apply" className="mt-6 w-full">Start Now <ArrowRight className="h-4 w-4" /></ButtonLink>
          </GlassCard>
        </Reveal>
      </section>
    </>
  );
}
