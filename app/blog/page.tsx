import type { Metadata } from "next";
import { Clock, ArrowRight, TrendingUp, ShieldCheck, Calculator, FileText, IndianRupee, Scale } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/effects/Reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides on personal loans, credit scores, EMI planning, and smart borrowing from Financily.",
};

const posts = [
  {
    icon: TrendingUp,
    title: "How to improve your CIBIL score in 90 days",
    category: "Credit Score",
    date: "12 Jan 2025",
    read: "6 min",
    excerpt: "Actionable steps to lift your score past 750 — from repayment habits to credit utilisation.",
    tint: "from-cyan-400 to-primary-500",
  },
  {
    icon: Calculator,
    title: "EMI explained: the math behind your monthly payment",
    category: "Loans",
    date: "28 Dec 2024",
    read: "5 min",
    excerpt: "Understand principal, interest, and tenure so you can pick the EMI that fits your budget.",
    tint: "from-primary-500 to-accent-500",
  },
  {
    icon: ShieldCheck,
    title: "Is your financial data safe? How loan marketplaces protect you",
    category: "Security",
    date: "15 Dec 2024",
    read: "4 min",
    excerpt: "What encryption, consent, and the DPDP Act mean for your personal and financial information.",
    tint: "from-emerald-400 to-cyan-500",
  },
  {
    icon: IndianRupee,
    title: "Personal loan vs. credit card: what's right for you?",
    category: "Compare",
    date: "2 Dec 2024",
    read: "7 min",
    excerpt: "A practical comparison of costs, flexibility, and impact on your credit profile.",
    tint: "from-accent-500 to-fuchsia-400",
  },
  {
    icon: Scale,
    title: "Self-employed? Here's how to get a personal loan",
    category: "Loans",
    date: "20 Nov 2024",
    read: "5 min",
    excerpt: "What documents NBFCs and banks look for, and how to present your income convincingly.",
    tint: "from-amber-400 to-orange-500",
  },
  {
    icon: FileText,
    title: "The 5 documents you'll always need for a loan application",
    category: "Guides",
    date: "8 Nov 2024",
    read: "3 min",
    excerpt: "Keep these ready to make your application instant and friction-free.",
    tint: "from-primary-500 to-cyan-400",
  },
];

const categories = ["All", "Loans", "Credit Score", "Security", "Guides", "Compare"];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={<span>Smart borrowing <span className="text-gradient">insights</span></span>}
        description="Practical guides on personal loans, credit health, EMI planning, and financial security."
      />

      <section className="section-shell py-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <span key={c} className={cn("chip cursor-default", i === 0 ? "border-cyan-400/60 bg-cyan-400/15 text-white" : "")}>
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-5 py-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <article className="glass card-hover group flex h-full flex-col rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <span className={cn("inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg", p.tint)}>
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="chip">{p.category}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-cyan-200">
                {p.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-400">{p.excerpt}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-500">
                <span>{p.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{p.read}</span>
              </div>
              <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                Read article <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          </Reveal>
        ))}
      </section>
    </>
  );
}
