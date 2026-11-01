"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { FIREBASE_MESSAGE } from "@/lib/firebase";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { configured } = useAuth();

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-[2rem] p-8">
          <div className="flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-6 font-display text-2xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>

          {!configured && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{FIREBASE_MESSAGE}</span>
            </div>
          )}

          <div className="mt-6">{children}</div>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm">
            <Link href="/" className="text-slate-400 transition-colors hover:text-cyan-300">
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
