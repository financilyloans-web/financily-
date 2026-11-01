import type { Metadata } from "next";
import { ArrowRight, Lightbulb } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { EmiCalculator } from "@/components/calculator/EmiCalculator";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "EMI Calculator",
  description:
    "Calculate your monthly loan EMI instantly with the Financily EMI calculator. Adjust amount, rate and tenure to see total interest and payment.",
};

const tips = [
  { t: "Longer tenure = lower EMI, but more total interest.", d: "Use the minimum tenure you can comfortably afford to save interest." },
  { t: "A higher down payment or lower principal shrinks interest.", d: "Every ₹1 lakh less borrowed can save thousands in interest." },
  { t: "Your credit score drives your rate.", d: "Score 750+ generally unlocks the best rates — lower EMI." },
  { t: "Compare offers before you commit.", d: "A 1% lower rate on ₹10L over 5 years saves roughly ₹30,000." },
];

export default function EmiCalculatorPage() {
  return (
    <>
      <PageHero
        eyebrow="EMI Calculator"
        title={<span>Plan your loan <span className="text-gradient">with precision</span></span>}
        description="Estimate your monthly instalment, total interest, and total payment in real time. No signup needed."
      />

      <section className="section-shell py-8">
        <EmiCalculator />
      </section>

      <section className="section-shell py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {tips.map((tip, i) => (
            <Reveal key={tip.t} delay={i * 0.06}>
              <GlassCard hover className="h-full p-6">
                <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-400 text-white">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">{tip.t}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{tip.d}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/apply" size="lg">
            Get matched with the best rates
            <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
