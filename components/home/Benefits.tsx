import { Zap, FileCheck2, ShieldCheck, Handshake, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";

const benefits = [
  {
    icon: Zap,
    title: "Fast Processing",
    desc: "Automated matching and instant pre-approval reduce wait times to hours.",
    list: ["Instant eligibility check", "24–72hr disbursal", "Real-time status updates"],
  },
  {
    icon: FileCheck2,
    title: "Paperless Verification",
    desc: "Upload documents once and let our partners verify digitally.",
    list: ["Aadhaar & PAN-based KYC", "Bank statement analysis", "No physical paperwork"],
  },
  {
    icon: ShieldCheck,
    title: "Secure Technology",
    desc: "Bank-grade encryption from application to disbursal.",
    list: ["256-bit SSL protection", "DPDP Act compliant", "SOC-grade data handling"],
  },
  {
    icon: Handshake,
    title: "Trusted Partners",
    desc: "We only connect you with RBI-regulated financial institutions.",
    list: ["700+ approved lenders", "Transparent fees", "No forced upsells"],
  },
];

export function Benefits() {
  return (
    <section className="section-shell py-20">
      <SectionHeading
        eyebrow="Benefits"
        title="Borrow with total confidence"
        description="A marketplace designed around your trust, privacy, and convenience."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {benefits.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.07}>
            <div className="glass card-hover grid h-full gap-6 rounded-3xl p-6 sm:grid-cols-[auto_1fr]">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-accent-600 text-white shadow-lg">
                <b.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{b.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{b.desc}</p>
                <ul className="mt-4 space-y-2">
                  {b.list.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
