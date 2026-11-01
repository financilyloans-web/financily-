import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Understand how Financily collects, uses, shares and protects your personal and financial information as a data fiduciary under the DPDP Act, 2023.",
};

const listClass = "list-disc pl-5 mb-4 space-y-2 text-slate-300/85 leading-relaxed text-sm";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy Policy"
        title="Your data, your control."
        description="Last updated: 25 August 2025. This policy explains how Financily Technologies Private Limited (“Financily”, “we”, “our”, “us”) collects, uses, shares and protects your information when you visit or use our website, mobile app or services."
      />

      <div className="section-shell pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <GlassCard className="mb-4 p-6 sm:p-8">
              <p className="text-base leading-relaxed text-slate-200">
                <span className="text-gradient font-semibold">
                  Financily acts as a data fiduciary
                </span>{" "}
                under the Digital Personal Data Protection Act, 2023 (DPDP Act). We process your
                personal data with your consent and on lawful basis, honour your rights of access,
                correction, erasure and portability, offer grievance redressal, and are steadily
                building toward full DPDP compliance. We maintain a GDPR-ready data structure to
                serve users in the European Union.
              </p>
            </GlassCard>
          </Reveal>

          <section aria-labelledby="info-we-collect">
            <h2 id="info-we-collect" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Information We Collect
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We collect information you provide directly, information collected automatically when
              you use our services, and information we receive from trusted third parties. The
              categories of information we collect include the following.
            </p>
          </section>

          <section aria-labelledby="personal-info">
            <h2 id="personal-info" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Personal Information
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Information that identifies you as an individual, including:
            </p>
            <ul className={listClass}>
              <li>Full name, date of birth, gender and photograph.</li>
              <li>Contact details such as email address, phone number and postal address.</li>
              <li>Government identifiers such as PAN, Aadhaar (where voluntarily provided) and other KYC documents.</li>
              <li>Employment details, designation, monthly income and tenure with current employer.</li>
            </ul>
          </section>

          <section aria-labelledby="financial-info">
            <h2 id="financial-info" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Financial Information
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Information relevant to assessing eligibility for a loan product, including:
            </p>
            <ul className={listClass}>
              <li>Income details, existing loans and repayment obligations.</li>
              <li>Credit score and credit-related information from credit bureaus (with your consent).</li>
              <li>Bank account details required for disbursal and repayment of loans.</li>
              <li>Loan preferences such as amount, tenure and purpose.</li>
            </ul>
          </section>

          <section aria-labelledby="device-info">
            <h2 id="device-info" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Device Information
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              When you access our platform, we automatically collect technical information such as:
            </p>
            <ul className={listClass}>
              <li>IP address, browser type and version, and operating system.</li>
              <li>Device identifiers, screen resolution and mobile network information.</li>
              <li>Pages visited, time spent, referral source and in-app actions.</li>
              <li>Logs of your interactions for security and diagnostics purposes.</li>
            </ul>
          </section>

          <section aria-labelledby="cookies">
            <h2 id="cookies" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Cookies
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We use cookies and similar technologies to keep you signed in, remember preferences, and
              understand how you use our services. For full details, including how to manage or
              disable cookies, please read our{" "}
              <a href="/cookie-policy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                Cookie Policy
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="data-usage">
            <h2 id="data-usage" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Data Usage
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We process personal data for the following purposes:
            </p>
            <ul className={listClass}>
              <li>To present relevant loan offers from approved lenders and facilitate your application.</li>
              <li>To verify your identity and eligibility and prevent fraud and misuse.</li>
              <li>To improve, personalise and secure our platform and customer experience.</li>
              <li>To communicate with you about your applications, account and service updates.</li>
              <li>To comply with legal, regulatory and statutory obligations.</li>
            </ul>
          </section>

          <section aria-labelledby="data-sharing">
            <h2 id="data-sharing" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Data Sharing
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We do not sell your personal data. We share information only where necessary and with
              appropriate safeguards, including:
            </p>
            <ul className={listClass}>
              <li>With our lending partners (banks, NBFCs and other lenders) to evaluate and service your loan application.</li>
              <li>With service providers who help us operate the platform (e.g. hosting, analytics, KYC verification, communication).</li>
              <li>With credit information companies and regulatory authorities where required or consented to.</li>
              <li>With legal advisers, auditors, or when required by law or a court order.</li>
            </ul>
          </section>

          <section aria-labelledby="customer-consent">
            <h2 id="customer-consent" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Customer Consent
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We process your personal data based on your consent or another lawful basis under the
              DPDP Act, 2023. Where consent is required, we seek your explicit, informed consent
              before collecting or sharing data. You may withdraw your consent at any time by
              contacting us or through your account settings; withdrawal does not affect the legality
              of processing carried out before withdrawal.
            </p>
          </section>

          <section aria-labelledby="third-party">
            <h2 id="third-party" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Third-Party Services
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Our platform may contain links to third-party websites, applications or services, or
              integrate third-party tools. We are not responsible for the privacy practices of such
              third parties. We encourage you to review their respective privacy policies before
              providing them with your information.
            </p>
          </section>

          <section aria-labelledby="security">
            <h2 id="security" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Security Measures
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We employ industry-standard technical and organisational measures to protect your data,
              including encryption in transit and at rest, role-based access controls, secure
              authentication, continuous monitoring and regular security audits. While no method of
              transmission over the internet is 100% secure, we strive to safeguard your information.
            </p>
          </section>

          <section aria-labelledby="user-rights">
            <h2 id="user-rights" className="font-display text-xl font-bold text-white mt-10 mb-3">
              User Rights
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Under the DPDP Act, 2023 and applicable law, you have the right to:
            </p>
            <ul className={listClass}>
              <li>Access the personal data we hold about you.</li>
              <li>Correct or update inaccurate or incomplete information.</li>
              <li>Request erasure of your personal data, subject to legal retention obligations.</li>
              <li>Request portability of your data in a structured, machine-readable format.</li>
              <li>Withdraw consent for processing at any time.</li>
              <li>Lodge a grievance and seek redressal from us, and file a complaint with the Data Protection Board of India (DPBI).</li>
            </ul>
          </section>

          <section aria-labelledby="retention">
            <h2 id="retention" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Data Retention Policy
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We retain personal data only for as long as necessary to fulfil the purposes described
              in this policy, to comply with legal and regulatory requirements, and to resolve
              disputes. When data is no longer needed, we securely delete or anonymise it.
            </p>
          </section>

          <section aria-labelledby="deletion">
            <h2 id="deletion" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Account Deletion Request
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              You may request the deletion of your account and associated personal data at any time.
              To do so, simply email us at{" "}
              <a href="mailto:privacy@financily.in" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                privacy@financily.in
              </a>{" "}
              or request deletion through your account settings. We will process your request within
              30 days, subject to verifying your identity and any legal retention obligations.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Contact Information
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              If you have questions about this policy, or wish to exercise your rights or file a
              grievance, please contact our Grievance Officer:
            </p>
            <ul className={listClass}>
              <li>
                Email:{" "}
                <a href="mailto:privacy@financily.in" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                  privacy@financily.in
                </a>
              </li>
              <li>Address: Financily Technologies Private Limited, Bengaluru, Karnataka, India.</li>
              <li>Response time: We aim to respond to all requests within 30 days.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
