import Link from "next/link";
import { Logo } from "./Logo";
import { Twitter, Linkedin, Instagram, Facebook, ShieldCheck } from "lucide-react";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Partner Lenders", href: "/partner-lenders" },
      { label: "Apply Now", href: "/apply" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "EMI Calculator", href: "/emi-calculator" },
      { label: "Eligibility Checker", href: "/eligibility-checker" },
      { label: "Personal Loan", href: "/personal-loan" },
      { label: "Login", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

const socials = [
  { label: "X (Twitter)", href: "https://x.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink-950/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="section-shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Financily is a digital loan marketplace that connects borrowers with
              approved banks, NBFCs, and lending partners. We are not a lender —
              we only facilitate your loan journey.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>256-bit SSL encrypted · DPDP Act compliant</span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-cyan-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-center text-xs text-slate-500 md:text-left">
            © {new Date().getFullYear()} Financily. All rights reserved. Financily
            is an independent loan aggregation platform and is not a lender, bank,
            or NBFC.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:text-white"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
