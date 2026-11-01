import type { Metadata } from "next";
import { ArrowRight, TrendingUp, FileCheck2, BadgeDollarSign } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { EligibilityChecker } from "@/components/calculator/EligibilityChecker";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Loan Eligibility Checker",
  description:
    "Check your personal loan eligibility instantly with the Financily eligibility checker. Estimate how much you can borrow based on income, credit score and EMI.",
};

const tips = [
  { icon: TrendingUp, title: "Improve your credit score", desc: "Pay bills on time, reduce credit utilisation, and clear small debts to push your score past 750." },
  { icon: FileCheck2, title: "Keep your income proof ready", desc: "Consistent salary or business income strengthens your application and can improve eligible limits." },
  { icon: BadgeDollarSign, title: "Lower existing EMIs", desc: "A lower fixed-obligation ratio lets you qualify for a higher loan amount." },
];

export default function EligibilityCheckerPage() {
  return (
    <>
      <PageHero
        eyebrow="Eligibility Checker"
        title={<span>Find out how much <span className="text-gradient">you can borrow</span></span>}
        description="Answer a few questions and get an instant, indicative eligibility estimate based on typical lender norms."
      />

      <section className="section-shell py-8">
        <EligibilityChecker />
        <p className="mt-4 text-center text-xs text-slate-500">
          Indicative estimate only. Final eligibility, amount and terms are solely decided by the lender.
        </p>
      </section>

      <section className="section-shell py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {tips.map((tip, i) => (
            <Reveal key={tip.title} delay={i * 0.07}>
              <GlassCard hover className="h-full p-6">
                <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                  <tip.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">{tip.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{tip.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/apply" size="lg">
            Apply Now — takes 3 minutes
            <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
