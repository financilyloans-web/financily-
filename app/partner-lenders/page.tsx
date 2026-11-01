import type { Metadata } from "next";
import { ArrowRight, Landmark, Building2, Cpu, ShieldCheck, BadgeCheck, FileCheck2 } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Partner Lenders",
  description:
    "Meet the approved banks, NBFCs and fintech lending partners Financily connects you with.",
};

const types = [
  { icon: Landmark, title: "Banks", desc: "RBI-regulated banks offering competitive rates and trusted service." },
  { icon: Building2, title: "NBFCs", desc: "Non-banking finance companies known for flexible eligibility." },
  { icon: Cpu, title: "Fintech Lenders", desc: "Digital-first lenders with instant approvals and fast disbursal." },
];

const assurances = [
  "All partners are RBI-regulated or authorized financial institutions",
  "Rates, fees, and terms are disclosed before you accept an offer",
  "Your application goes only to lenders you consent to share with",
  "Zero obligation — applying does not guarantee approval",
];

export default function PartnerLendersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner Lenders"
        title={<span>A network of <span className="text-gradient">approved lenders</span></span>}
        description="Financily connects you with 700+ trusted banks, NBFCs, and lending partners — so you always have real choice."
      />

      <section className="section-shell grid gap-5 py-10 md:grid-cols-3">
        {types.map((t, i) => (
          <Reveal key={t.title} delay={i * 0.06}>
            <GlassCard hover className="h-full p-6">
              <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                <t.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-white">{t.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{t.desc}</p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="section-shell py-10">
        <div className="glass-strong overflow-hidden rounded-3xl p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">How we onboard lenders</h2>
              <p className="mt-3 text-slate-300/85">
                Every partner undergoes a rigorous diligence process covering
                licensing, compliance, security, and customer experience before
                they join our marketplace.
              </p>
              <ul className="mt-5 space-y-3">
                {assurances.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-sm text-slate-200">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-7">
              <BadgeCheck className="h-9 w-9 text-cyan-300" />
              <h3 className="mt-4 font-display text-xl font-bold text-white">Become a partner lender</h3>
              <p className="mt-2 text-sm text-slate-400">
                Reach millions of credit-ready borrowers. If you&apos;re an RBI-regulated
                lender, we&apos;d love to talk.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/contact" size="md">
                  Get in touch <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" size="md">
                  <FileCheck2 className="h-4 w-4" /> Partner FAQs
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 text-center">
        <SectionHeading title="Your application is sent only to lenders you approve" description="We respect your consent — you stay in control of who sees your data." />
        <ButtonLink href="/apply" size="lg">
          Start Matching with Lenders
          <ArrowRight className="h-5 w-5" />
        </ButtonLink>
      </section>
    </>
  );
}
