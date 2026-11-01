"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ConsentBanners } from "./ConsentBanners";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { ChatAssistant } from "./ChatAssistant";
import { ParticleCanvas } from "@/components/effects/ParticleCanvas";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col">
        <div aria-hidden className="bg-aurora pointer-events-none fixed inset-0 -z-10" />
        <div aria-hidden className="animate-aurora pointer-events-none fixed -top-40 -left-32 -z-10 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(47,107,255,0.5), transparent 70%)" }} />
        <div aria-hidden className="animate-aurora pointer-events-none fixed -bottom-40 -right-32 -z-10 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(124,58,237,0.5), transparent 70%)", animationDelay: "6s" }} />
        <div aria-hidden className="animate-grid pointer-events-none fixed inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <ParticleCanvas />
        <MouseGlow />

        <Header />

        <main className="relative flex-1 pt-24">{children}</main>

        <Footer />

        <ConsentBanners />
        <ChatAssistant />
        <WhatsAppFloat />
      </div>
    </AuthProvider>
  );
}
