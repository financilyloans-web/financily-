"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Headset } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";

const channels = [
  { icon: Mail, title: "Email", value: "support@financily.in", href: "mailto:support@financily.in" },
  { icon: Phone, title: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MapPin, title: "Office", value: "Financily Technologies Pvt. Ltd., Bengaluru, Karnataka, India", href: undefined },
  { icon: Clock, title: "Support Hours", value: "Mon–Sat, 9 AM – 8 PM IST", href: undefined },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<span>We&apos;re here to <span className="text-gradient">help</span></span>}
        description="Questions about loans, applications, partnerships, or privacy? Reach out and we'll respond within one business day."
      />

      <section className="section-shell grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          {channels.map((c) => (
            <GlassCard key={c.title} hover className="p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-slate-400">{c.title}</p>
                  {c.href ? (
                    <a href={c.href} className="font-semibold text-white hover:text-cyan-300">{c.value}</a>
                  ) : (
                    <p className="font-medium text-white">{c.value}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
            <Headset className="h-5 w-5 text-cyan-300" /> Send us a message
          </h2>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <p className="font-display text-lg font-bold text-white">Message sent!</p>
              <p className="text-sm text-slate-300">Thank you — our team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Full name" className="input-glass" />
                <input required type="email" placeholder="Email address" className="input-glass" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input placeholder="Phone (optional)" className="input-glass" />
                <select className="input-glass" defaultValue="Loan Support">
                  <option>Loan Support</option>
                  <option>Application Status</option>
                  <option>Partnership Enquiry</option>
                  <option>Privacy / Data</option>
                  <option>Other</option>
                </select>
              </div>
              <textarea required rows={5} placeholder="How can we help?" className="input-glass resize-none" />
              <button type="submit" className="btn-primary w-full">
                <Send className="h-4 w-4" /> Send Message
              </button>
            </form>
          )}
        </GlassCard>
      </section>
    </>
  );
}
