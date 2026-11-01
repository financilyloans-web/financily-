import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Financily uses cookies and similar technologies, the categories of cookies we set, and how you can manage your preferences.",
};

const listClass = "list-disc pl-5 mb-4 space-y-2 text-slate-300/85 leading-relaxed text-sm";

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Cookie Policy"
        title="Cookies, made simple."
        description="Last updated: 25 August 2025. This Cookie Policy explains what cookies are, how Financily uses them, and the choices you have over them when you visit or use our website and mobile app."
      />

      <div className="section-shell pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <GlassCard className="mb-4 p-6 sm:p-8">
              <p className="text-base leading-relaxed text-slate-200">
                <span className="text-gradient font-semibold">We respect your privacy.</span> Cookies
                help our platform remember your preferences, keep you signed in, understand usage, and
                deliver an improved experience. You can disable or delete cookies at any time through
                your browser settings, though some features may not work as intended.
              </p>
            </GlassCard>
          </Reveal>

          <section aria-labelledby="what-are-cookies">
            <h2 id="what-are-cookies" className="font-display text-xl font-bold text-white mt-10 mb-3">
              What Are Cookies?
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Cookies are small text files stored on your device when you visit a website. They are
              widely used to make websites work efficiently, remember your preferences, and provide
              information to site owners. We also use similar technologies such as local storage and
              pixels for the same purposes.
            </p>
          </section>

          <section aria-labelledby="how-we-use">
            <h2 id="how-we-use" className="font-display text-xl font-bold text-white mt-10 mb-3">
              How We Use Cookies
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We use cookies to:
            </p>
            <ul className={listClass}>
              <li>Keep you signed in and maintain your session securely.</li>
              <li>Remember your preferences and settings.</li>
              <li>Understand how you use the platform so we can improve it.</li>
              <li>Deliver relevant content and measure the effectiveness of our marketing.</li>
              <li>Detect and prevent fraudulent or abusive activity.</li>
            </ul>
          </section>

          <section aria-labelledby="categories">
            <h2 id="categories" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Categories of Cookies We Use
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              The cookies we use fall into the following categories:
            </p>
            <ul className={listClass}>
              <li>
                <span className="font-semibold text-white">Essential cookies:</span> required for the
                platform to function (e.g. authentication, security, load balancing). These cannot be
                disabled.
              </li>
              <li>
                <span className="font-semibold text-white">Analytics cookies:</span> help us count
                visits, measure traffic and understand user behaviour so we can optimise performance.
              </li>
              <li>
                <span className="font-semibold text-white">Functional cookies:</span> remember choices
                such as language and display preferences to personalise your experience.
              </li>
              <li>
                <span className="font-semibold text-white">Advertising / marketing cookies:</span> are
                used, where applicable, to measure campaign effectiveness and show relevant offers.
                We do not sell your data or use it for cross-site profiling without consent.
              </li>
            </ul>
          </section>

          <section aria-labelledby="third-party">
            <h2 id="third-party" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Third-Party Cookies
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              Some cookies may be set by third-party service providers we rely on, such as analytics
              and verification partners. These providers may process data in accordance with their own
              privacy policies. We encourage you to review their policies for more information about
              how they handle your data.
            </p>
          </section>

          <section aria-labelledby="managing">
            <h2 id="managing" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              You can control cookies through your browser settings, including the options to block or
              delete cookies and to receive a warning before a cookie is set. You can also use our
              consent banner to adjust non-essential cookies. Please note that disabling cookies may
              affect the availability and functionality of parts of the platform.
            </p>
          </section>

          <section aria-labelledby="updates">
            <h2 id="updates" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Updates to This Policy
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              We may update this Cookie Policy from time to time to reflect changes in our use of
              cookies or legal requirements. Any changes will be posted on this page with a revised
              “Last updated” date. Where required, we will seek your consent for new categories of
              cookies.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact" className="font-display text-xl font-bold text-white mt-10 mb-3">
              Contact
            </h2>
            <p className="text-slate-300/85 leading-relaxed mb-4 text-sm">
              If you have questions about this Cookie Policy or our use of cookies, please contact us
              at{" "}
              <a href="mailto:privacy@financily.in" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                privacy@financily.in
              </a>{" "}
              or write to Financily Technologies Private Limited, Bengaluru, Karnataka, India.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
