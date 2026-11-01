"use client";

import { useState } from "react";
import { ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/effects/Reveal";

export function CtaBand() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setDone(true);
    }
  };

  return (
    <section className="section-shell py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary-600/40 via-ink-800 to-accent-600/40 p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                Ready to find the right loan for you?
              </h2>
              <p className="mt-4 max-w-lg text-pretty text-slate-300/85">
                Compare offers from 700+ approved lenders and get funded in as
                little as 24 hours. No fees, no obligations.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <ButtonLink href="/apply" size="lg">
                  Apply Now
                  <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink href="/eligibility-checker" variant="ghost" size="lg">
                  Check Eligibility
                </ButtonLink>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <p className="font-semibold text-white">Stay ahead of the market</p>
              <p className="mt-1 text-sm text-slate-400">
                Get rate trends and loan tips in your inbox. No spam, ever.
              </p>
              {done ? (
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  You&apos;re subscribed. Welcome aboard!
                </div>
              ) : (
                <form onSubmit={subscribe} className="mt-5 space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-glass"
                  />
                  <button type="submit" className="btn-primary w-full">
                    <Send className="h-4 w-4" />
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
