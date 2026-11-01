import { Search, FileText, Scale, UserCheck, Banknote, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";

const steps = [
  { icon: Search, title: "Check Eligibility", desc: "Answer a few quick questions to see if you qualify." },
  { icon: FileText, title: "Submit Details", desc: "Fill the 3-minute online form and upload documents." },
  { icon: Scale, title: "Compare Offers", desc: "Review personalized offers from multiple lenders side-by-side." },
  { icon: UserCheck, title: "Lender Verification", desc: "Your chosen lender verifies KYC and income digitally." },
  { icon: Banknote, title: "Loan Disbursal", desc: "Funds are credited to your account — often within 24–72 hours." },
];

export function LoanProcess() {
  return (
    <section className="relative py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden lg:block">
        <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" />
      </div>

      <div className="section-shell">
        <SectionHeading
          eyebrow="Simple 5-Step Process"
          title="From application to approval in five easy steps"
          description="A seamless, transparent journey designed to get you funded fast."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="group relative h-full rounded-3xl border border-white/10 bg-white/5 p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/40 hover:bg-white/10">
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-ink-950 bg-cyan-400 text-xs font-bold text-ink-950">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-cyan-400/60 lg:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/apply" size="lg">
            Start Your Loan Application
            <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
