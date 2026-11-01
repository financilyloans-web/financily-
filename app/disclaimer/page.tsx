import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important disclaimers regarding the Financily loan marketplace, including the absence of financial advice and the role of third-party lenders.",
};

const listClass = "list-disc pl-5 mb-4 space-y-2 text-slate-300/85 leading-relaxed text-sm";

export default function DisclaimerPage() {
  return (
    <>
      <PageHero
        eyebrow="Disclaimer"
        title="Please read before using our services."
        description="Last updated: 25 August 2025. This disclaimer applies to the Financily platform operated by Financily Technologies Private Limited. By using our services, you acknowledge and accept the terms described below."
      />

      <div className="section-shell pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <GlassCard className="mb-4 p-6 sm:p-8">
              <p className="text-base leading-relaxed text-slate-200">
                <span className="text-gradient font-semibold">Financily is a loan marketplace</span>{" "}
                — not a lender. We facilitate connections between users and banks, NBFCs and lending
                partners. We do not provide loans, guarantee approvals, or set interest rates. All
                lending decisions rest solely with the respective lender.
              </p>
            </GlassCard>
          </Reveal>

          <section aria-labelledby="general">
            <h2 id="general" className="font-display text-xl font-bold text-white mt-10 mb-3">
              General Disclaimer
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              The information published on this platform is provided in good faith for general
              informational purposes only. While we strive to keep the information accurate and
              up-to-date, we make no representations or warranties of any kind, express or implied,
              about the completeness, accuracy, reliability, suitability or availability of the
              information. Any reliance you place on such information is strictly at your own risk.
            </p>
          </section>

          <section aria-labelledby="no-financial-advice">
            <h2 id="no-financial-advice" className="font-display text-xl font-bold text-white mt-10 mb-3">
              No Financial or Investment Advice
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Nothing on our platform constitutes financial, investment, legal, accounting, tax, or
              other professional advice. Loan comparisons, estimates, eligibility checks and any other
              tools are provided for convenience only and should not be treated as a recommendation to
              borrow. Always consult a qualified professional before making borrowing or investment
              decisions.
            </p>
          </section>

          <section aria-labelledby="marketplace-disclaimer">
            <h2 id="marketplace-disclaimer" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Loan Marketplace Disclaimer
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Financily acts as an intermediary connecting you with lenders. We are not a party to any
              loan agreement, do not disburse funds, and do not assume any liability for the actions,
              omissions, or products of any lender. The loan agreement, terms, interest rates,
              processing fees, and repayment obligations are the sole responsibility of the lender and
              the borrower.
            </p>
          </section>

          <section aria-labelledby="accuracy">
            <h2 id="accuracy" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Accuracy of Information
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              The offers, rates, and terms displayed on the platform are indicative and may change
              without notice based on lender discretion, market conditions, and your credit profile.
              We do not warrant that any particular lender will offer you a loan or that the displayed
              terms will apply to your application.
            </p>
          </section>

          <section aria-labelledby="links">
            <h2 id="links" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Third-Party Links
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              The platform may contain links to external websites, applications, or services owned and
              operated by third parties. We have no control over, and assume no responsibility for,
              the content, privacy practices, or availability of these external resources. Accessing
              them is done at your own discretion.
            </p>
          </section>

          <section aria-labelledby="availability">
            <h2 id="availability" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Technology, Availability & Service Interruptions
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We do not guarantee that the platform will be continuously available, secure, or free
              from errors, viruses, or other harmful components. We may suspend, restrict, or
              discontinue parts of the service for maintenance, upgrades, or other reasons at any time
              without prior notice.
            </p>
          </section>

          <section aria-labelledby="limitation">
            <h2 id="limitation" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Limitation of Liability
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              To the maximum extent permitted by law, Financily and its affiliates, officers,
              directors, employees, and agents shall not be liable for any loss or damage, including
              indirect, incidental, special, or consequential loss, arising out of or in connection
              with your use of the platform, reliance on its content, or any loan or service provided
              by a third-party lender.
            </p>
          </section>

          <section aria-labelledby="regulatory">
            <h2 id="regulatory" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Regulatory & Compliance Note
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Financily operates in compliance with applicable Indian laws, including the Digital
              Personal Data Protection Act, 2023 (DPDP Act). Lenders offering products through our
              marketplace are regulated by the Reserve Bank of India (RBI) and other applicable
              authorities. We encourage you to review lender-specific terms and documentation before
              proceeding.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Contact
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              If you have any questions regarding this disclaimer, please contact us at{" "}
              <a href="mailto:support@financily.in" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                support@financily.in
              </a>{" "}
              or write to Financily Technologies Private Limited, Bengaluru, Karnataka, India.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
