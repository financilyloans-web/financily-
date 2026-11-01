"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { FIREBASE_MESSAGE } from "@/lib/firebase";
import { ButtonLink } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !configured) return;
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, configured, router, pathname]);

  if (!configured) {
    return (
      <div className="section-shell py-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass max-w-xl rounded-3xl p-8">
          <ShieldAlert className="h-10 w-10 text-amber-300" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Authentication not configured</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{FIREBASE_MESSAGE}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/">Back to home</ButtonLink>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
