import type { Metadata } from "next";
import { ArrowRight, ShieldCheck, Eye, HeartHandshake, Compass } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Counter } from "@/components/effects/Counter";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Financily is a digital loan marketplace connecting borrowers with approved banks, NBFCs and lending partners. We are not a lender.",
};

const stats = [
  { value: 700, suffix: "+", label: "Approved lenders" },
  { value: 5, suffix: "L+", label: "Loans facilitated" },
  { value: 24, suffix: "hrs", label: "Avg approval time" },
  { value: 4.8, decimals: 1, suffix: "★", label: "Customer rating" },
];

const values = [
  { icon: Eye, title: "Transparency", desc: "We show every fee, rate, and term clearly — no hidden surprises." },
  { icon: ShieldCheck, title: "Security", desc: "Bank-grade encryption and DPDP-compliant handling of your data." },
  { icon: HeartHandshake, title: "Customer-first", desc: "We match you with lenders that fit your profile, not just anyone." },
  { icon: Compass, title: "Fairness", desc: "We never steer you to costlier loans. You compare and choose." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={<span>A smarter way to <span className="text-gradient">borrow</span></span>}
        description="Financily is an independent digital loan marketplace. We help you find, compare, and apply for personal loans through approved banks, NBFCs, and lending partners."
      />

      <section className="section-shell py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <GlassCard className="h-full p-6 text-center">
                <p className="text-gradient font-display text-4xl font-bold">
                  <Counter to={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-slate-400">{s.label}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-shell py-10">
        <div className="glass-strong rounded-3xl p-8 lg:p-10">
          <h2 className="font-display text-2xl font-bold text-white">We are a platform — not a lender</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-300/85">
            Financily is not a lender, financial institution, bank, or NBFC.
            We are a loan aggregation and lead-generation platform that connects
            borrowers with approved third-party lending partners. Loan approval,
            interest rates, processing fees, eligibility, and final terms are
            solely determined by the respective lender. This keeps us objective:
            our job is to give you the widest, clearest choice.
          </p>
        </div>
      </section>

      <section className="section-shell py-14">
        <SectionHeading title="What we stand for" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <GlassCard hover className="h-full p-6">
                <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{v.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-shell py-10 text-center">
        <Reveal>
          <div className="glass rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold text-white">Ready to get started?</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300/85">
              Join thousands of borrowers who found the right loan through Financily.
            </p>
            <ButtonLink href="/apply" size="lg" className="mt-6">
              Apply for a Loan
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
