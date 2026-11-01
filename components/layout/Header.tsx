"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogIn, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Loans", href: "/personal-loan" },
  { label: "EMI Calculator", href: "/emi-calculator" },
  { label: "Eligibility", href: "/eligibility-checker" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2.5" : "py-4",
      )}
    >
      <div className="section-shell">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-5",
            "border border-white/10 bg-ink-950/70 backdrop-blur-2xl",
            scrolled && "shadow-[0_18px_50px_-16px_rgba(2,4,16,0.9)]",
          )}
        >
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "text-white" : "text-slate-300/80 hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white sm:inline-flex"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-[11px] font-bold text-white">
                  {(user.displayName || "U").charAt(0)}
                </span>
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white sm:inline-flex"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
            <Link
              href="/apply"
              className="btn-primary hidden px-5 py-2.5 text-sm sm:inline-flex"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-3 top-20 z-40 lg:hidden"
          >
            <div className="surface-solid rounded-3xl p-4">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium",
                        pathname === item.href
                          ? "bg-white/10 text-white"
                          : "text-slate-200 hover:bg-white/5",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                {user ? (
                  <Link href="/dashboard" className="btn-ghost px-4 py-3 text-sm">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="btn-ghost px-4 py-3 text-sm">
                    Login
                  </Link>
                )}
                <Link href="/apply" className="btn-primary px-4 py-3 text-sm">
                  Apply Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
