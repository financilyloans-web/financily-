import type { Metadata } from "next";
import { ShieldCheck, Lock } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { ApplyForm } from "@/components/apply/ApplyForm";

export const metadata: Metadata = {
  title: "Apply for a Loan",
  description:
    "Apply for a personal loan with Financily in under 3 minutes. Compare offers from approved banks, NBFCs and lending partners.",
};

export default function ApplyPage() {
  return (
    <>
      <PageHero
        eyebrow="Loan Application"
        title={<span>Apply in <span className="text-gradient">under 3 minutes</span></span>}
        description="Fill in a few details and get matched with approved lenders. No obligation, no charges."
      />

      <section className="section-shell py-6">
        <ApplyForm />
      </section>

      <section className="section-shell pb-14 pt-4">
        <div className="mx-auto max-w-2xl space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
            <p>
              <strong className="text-white">Financily is not a lender</strong>, financial
              institution, bank, or NBFC. Financily is a loan aggregation platform that connects
              borrowers with approved third-party lending partners. Loan approval, interest rates,
              processing fees, eligibility, and final terms are solely determined by the respective
              lender.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" /> Your information is encrypted and shared only with lenders you consent to.
          </div>
        </div>
      </section>
    </>
  );
}
