import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Financily home">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-[0_8px_24px_-6px_rgba(20,184,166,0.7)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2l8 4.5v5.5c0 5-3.4 8.6-8 9.5-4.6-.9-8-4.5-8-9.5V6.5L12 2z"
            fill="rgba(255,255,255,0.12)"
            stroke="white"
            strokeWidth="1.4"
          />
          <path d="M8 12.5l2.6 2.6 5.4-5.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute inset-0 rounded-2xl bg-cyan-400/40 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-white">
        FINANC<span className="text-gradient">ILY</span>
      </span>
    </Link>
  );
}
