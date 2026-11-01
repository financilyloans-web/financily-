import { Zap, Globe, ShieldCheck, TrendingUp, Building2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";

const features = [
  {
    icon: Zap,
    title: "Fast Approvals",
    desc: "Get pre-approval in minutes and disbursal within 24–72 hours in most cases.",
    tint: "from-cyan-400 to-primary-500",
  },
  {
    icon: Globe,
    title: "100% Online Process",
    desc: "Compare, apply, and submit documents digitally — no branches, no paperwork.",
    tint: "from-primary-500 to-accent-500",
  },
  {
    icon: ShieldCheck,
    title: "Secure Application",
    desc: "Your data is encrypted and protected with 256-bit SSL and DPDP-compliant handling.",
    tint: "from-emerald-400 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Competitive Offers",
    desc: "Rates starting at 8.5% p.a. with personalized offers from multiple lenders.",
    tint: "from-accent-500 to-fuchsia-400",
  },
  {
    icon: Building2,
    title: "Multiple Lenders",
    desc: "Compare 700+ approved banks, NBFCs, and lending partners on one platform.",
    tint: "from-amber-400 to-orange-500",
  },
];

export function WhyChoose() {
  return (
    <section className="section-shell py-20">
      <SectionHeading
        eyebrow="Why Choose Financily"
        title="Everything you need, in one place"
        description="We make borrowing smarter, faster, and more transparent — with the power of choice."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <div className="glass card-hover group h-full rounded-3xl p-6">
              <div className={`inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.tint} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.3}>
          <div className="flex h-full flex-col justify-center rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-6 text-center">
            <p className="font-display text-3xl font-bold text-white">5+ <span className="text-gradient">lakh</span></p>
            <p className="mt-1 text-sm text-slate-400">loans facilitated till date</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
