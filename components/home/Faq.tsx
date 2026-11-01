"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is Financily a lender?",
    a: "No. Financily is a loan aggregation and lead-generation platform. We are not a bank, lender, or NBFC. We connect you with approved third-party lending partners who make all approval and lending decisions.",
  },
  {
    q: "Is there any fee to use Financily?",
    a: "Using Financily to compare and apply is free for borrowers. Any processing fees are set and charged solely by the respective lender, and we always disclose them transparently before you accept an offer.",
  },
  {
    q: "How fast can I get a loan?",
    a: "Pre-approval can be instant once your details match a lender's criteria. Final disbursal typically happens within 24–72 hours after lender verification, depending on the lender and your profile.",
  },
  {
    q: "What is the minimum income required?",
    a: "Eligibility varies by lender. Salaried applicants generally need at least ₹20,000/month, while self-employed applicants typically need a stable income track record and sufficient business vintage.",
  },
  {
    q: "Is my personal data safe?",
    a: "Yes. Your data is encrypted in transit and at rest, handled in line with the DPDP Act (India) and GDPR-ready practices, and shared only with lending partners you explicitly consent to. We never sell your information.",
  },
  {
    q: "What documents do I need?",
    a: "Typically: PAN card, Aadhaar, last 3–6 months of bank statements, and income proof (salary slips or ITR). The process is fully paperless — upload everything online.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-shell py-20">
      <SectionHeading
        eyebrow="FAQs"
        title="Frequently asked questions"
        description="Everything you need to know before you apply."
      />
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((item, i) => {
          const open = openIndex === i;
          return (
            <div
              key={item.q}
              className={cn(
                "overflow-hidden rounded-2xl border transition-colors",
                open ? "border-cyan-400/40 bg-white/8" : "border-white/10 bg-white/5",
              )}
            >
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
              >
                <span className="font-semibold text-white">{item.q}</span>
                <motion.span
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    open ? "bg-gradient-to-br from-cyan-400 to-primary-500 text-white" : "bg-white/10 text-slate-300",
                  )}
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-300">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
