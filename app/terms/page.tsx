import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing your use of the Financily loan marketplace platform, including eligibility, responsibilities, lender disclaimers and liability limits.",
};

const listClass = "list-disc pl-5 mb-4 space-y-2 text-slate-300/85 leading-relaxed text-sm";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms & Conditions"
        title="Clear terms for a transparent marketplace."
        description="Last updated: 25 August 2025. These Terms & Conditions (“Terms”) govern your access to and use of the Financily platform (website and mobile app) operated by Financily Technologies Private Limited. Please read them carefully before using our services."
      />

      <div className="section-shell pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <GlassCard className="mb-4 p-6 sm:p-8">
              <p className="text-base leading-relaxed text-slate-200">
                <span className="text-gradient font-semibold">By using Financily</span>, you agree to
                be bound by these Terms, our{" "}
                <a href="/privacy-policy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Privacy Policy
                </a>{" "}
                and our{" "}
                <a href="/disclaimer" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  Disclaimer
                </a>
                . If you do not agree, please discontinue use of the platform.
              </p>
            </GlassCard>
          </Reveal>

          <section aria-labelledby="acceptance">
            <h2 id="acceptance" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              By accessing or using our platform, creating an account, or submitting a loan
              application, you acknowledge that you have read, understood and agreed to these Terms.
              Continued use of the platform after changes to these Terms constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          <section aria-labelledby="eligibility">
            <h2 id="eligibility" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Eligibility
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              To use our services, you must:
            </p>
            <ul className={listClass}>
              <li>Be at least 18 years of age.</li>
              <li>Be a resident of India or otherwise eligible to apply for credit in India.</li>
              <li>Provide accurate, current and complete information as requested.</li>
              <li>Have the legal capacity to enter into binding agreements.</li>
            </ul>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We do not guarantee that you will qualify for any loan product. Final eligibility is
              determined by each lender based on its own lending criteria.
            </p>
          </section>

          <section aria-labelledby="marketplace-disclaimer">
            <h2 id="marketplace-disclaimer" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Loan Marketplace Disclaimer
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Financily is a digital marketplace that connects you with banks, NBFCs and lending
              partners. We are not a lender and do not provide loans, disburse funds, or set interest
              rates. All loan approvals, terms, interest rates, charges and repayment schedules are
              solely determined by the respective lender. The final loan agreement is between you and
              the lender.
            </p>
          </section>

          <section aria-labelledby="user-responsibilities">
            <h2 id="user-responsibilities" className="font-display text-xl font-bold text-white mt-10 mb-3">
              User Responsibilities
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              You agree to:
            </p>
            <ul className={listClass}>
              <li>Use the platform only for lawful purposes related to applying for credit.</li>
              <li>Keep your account credentials confidential and notify us of any unauthorised use.</li>
              <li>Provide truthful and accurate information at all times.</li>
              <li>Comply with all applicable laws, rules and regulations.</li>
            </ul>
          </section>

          <section aria-labelledby="accuracy">
            <h2 id="accuracy" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Accuracy of Information
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              You are responsible for the accuracy and completeness of the information you provide.
              Inaccurate or incomplete information may lead to application rejection, delays, or
              adverse credit impact. While we strive for accuracy, we do not warrant that all
              information on the platform is error-free.
            </p>
          </section>

          <section aria-labelledby="third-party">
            <h2 id="third-party" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Third-Party Lenders & Services
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Our platform may link to or integrate with third-party lenders, payment providers, KYC
              verification services and other external services. We do not control these third
              parties and are not responsible for their products, services, or practices. Your
              interactions with them are governed by their own terms and policies.
            </p>
          </section>

          <section aria-labelledby="no-advice">
            <h2 id="no-advice" className="font-display text-xl font-bold text-white mt-10 mb-3">
              No Financial Advice
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              The content on our platform, including loan comparisons, information and tools, is for
              general information only and does not constitute financial, investment, legal or tax
              advice. You should consult a qualified professional before making financial decisions.
            </p>
          </section>

          <section aria-labelledby="ip">
            <h2 id="ip" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Intellectual Property
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              All content on the platform — including text, graphics, logos, software, designs and
              trademarks — is the property of Financily or its licensors and is protected by
              applicable intellectual property laws. You may not copy, reproduce, distribute, or
              create derivative works without prior written permission.
            </p>
          </section>

          <section aria-labelledby="prohibited">
            <h2 id="prohibited" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Prohibited Activities
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              You agree not to:
            </p>
            <ul className={listClass}>
              <li>Use the platform for any fraudulent, unlawful or harmful purpose.</li>
              <li>Attempt to gain unauthorised access to our systems or other users' data.</li>
              <li>Upload malicious software, interfere with the platform, or overload its infrastructure.</li>
              <li>Scrape, copy, or resell platform content or data.</li>
              <li>Impersonate another person or entity.</li>
            </ul>
          </section>

          <section aria-labelledby="disclaimers">
            <h2 id="disclaimers" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Disclaimers
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              The platform is provided on an “as is” and “as available” basis. To the maximum extent
              permitted by law, Financily disclaims all warranties, whether express or implied,
              including warranties of merchantability, fitness for a particular purpose and
              non-infringement. We do not warrant that the platform will be uninterrupted, secure, or
              error-free.
            </p>
          </section>

          <section aria-labelledby="limitation">
            <h2 id="limitation" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Limitation of Liability
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              To the maximum extent permitted by law, Financily shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits, data,
              goodwill, or opportunities arising out of or related to your use of the platform. Our
              total aggregate liability for any claim shall not exceed the amount paid by you to
              Financily in the six months preceding the claim, or INR 10,000, whichever is lower.
            </p>
          </section>

          <section aria-labelledby="indemnification">
            <h2 id="indemnification" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Indemnification
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              You agree to indemnify and hold Financily, its affiliates, officers, directors,
              employees and agents harmless from any claims, losses, damages, liabilities and expenses
              (including legal fees) arising out of your use of the platform, your violation of these
              Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section aria-labelledby="termination">
            <h2 id="termination" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Termination
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We may suspend or terminate your access to the platform at any time, with or without
              notice, if we reasonably believe you have violated these Terms or applicable law. You
              may close your account at any time; clauses that by their nature should survive
              termination (including disclaimers, limitation of liability and indemnification) will
              continue to apply.
            </p>
          </section>

          <section aria-labelledby="governing-law">
            <h2 id="governing-law" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Governing Law & Jurisdiction
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              These Terms are governed by and construed in accordance with the laws of India. Any
              disputes shall be subject to the exclusive jurisdiction of the courts of Bengaluru,
              Karnataka, India, unless otherwise required by law.
            </p>
          </section>

          <section aria-labelledby="changes">
            <h2 id="changes" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Changes to These Terms
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We may update these Terms from time to time. We will notify you of material changes by
              posting the revised Terms on this page and updating the “Last updated” date. Continued
              use of the platform after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Contact Us
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              For questions about these Terms, please contact us at{" "}
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
