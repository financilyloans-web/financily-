import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://financily.in"),
  title: {
    default: "Financily — Get Instant Personal Loans Through Trusted Lenders",
    template: "%s · Financily",
  },
  description:
    "Financily is a digital loan marketplace connecting you with approved banks, NBFCs and lending partners. Compare instant personal loan offers, check eligibility, and apply 100% online.",
  keywords: [
    "instant personal loan",
    "loan marketplace",
    "compare loans India",
    "personal loan eligibility",
    "EMI calculator",
    "Financily",
  ],
  applicationName: "Financily",
  authors: [{ name: "Financily" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Financily",
    title: "Financily — Get Instant Personal Loans Through Trusted Lenders",
    description:
      "Compare instant personal loan offers from approved banks, NBFCs and lending partners. Apply 100% online.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="grain min-h-screen antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
