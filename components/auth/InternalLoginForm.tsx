"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, UserCog, Briefcase, ShieldCheck } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { useAuth } from "./AuthProvider";
import { cn } from "@/lib/utils";
import { getStaffRole, roleMatches, type StaffRole } from "@/lib/staff";

type Role = StaffRole;

const ROLES: { id: Role; label: string; icon: typeof Briefcase; hint: string }[] = [
  { id: "agent", label: "Agent Login", icon: Briefcase, hint: "For field agents & partners" },
  { id: "employee", label: "Employee Login", icon: UserCog, hint: "For Financily staff" },
];

export function InternalLoginForm() {
  const { signInWithEmail, logout } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<Role>("agent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let firebaseUser: { email?: string | null; uid?: string } | null = null;
    try {
      const user = await signInWithEmail(email, password);
      firebaseUser = user;
      const provisioned = await getStaffRole(user.email ?? email);

      if (!roleMatches(provisioned, role)) {
        // Role mismatch (or unprovisioned account): do NOT allow access. Sign
        // the user back out so they can't stay authenticated in the wrong role.
        await logout();
        setError(
          provisioned
            ? `This account is provisioned as an ${provisioned}. Please use the ${
                provisioned === "agent" ? "Agent Login" : "Employee Login"
              } tab.`
            : "This account is not provisioned for the internal portal. Contact Financily admin to assign a role.",
        );
        return;
      }

      sessionStorage.setItem("financily_staff_role", role);
      router.push("/staff");
    } catch (err: any) {
      // If Firebase auth succeeded but our role check threw, make sure we
      // didn't leave the user signed in to the wrong portal.
      if (firebaseUser) {
        try {
          await logout();
        } catch {
          /* ignore */
        }
      }
      setError(err?.message?.replace("Firebase: ", "") || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Internal Login" subtitle="Restricted portal — for agents and employees only.">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2.5">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition-all",
                role === r.id
                  ? "border-cyan-400/50 bg-cyan-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/20",
              )}
            >
              <r.icon className={cn("h-5 w-5", role === r.id ? "text-cyan-300" : "text-slate-400")} />
              <span className="mt-1.5 block text-sm font-semibold text-white">{r.label}</span>
              <span className="text-[11px] text-slate-400">{r.hint}</span>
            </button>
          ))}
        </div>

        {/* Email + password only — no registration, no Google */}
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email address" className="input-glass pl-10" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-glass pl-10 pr-11" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Toggle password">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {role === "agent" ? "Continue as Agent" : "Continue as Employee"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <span>
          No account registration available here. Credentials are issued by
          Financily admin only.
        </span>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4 text-center text-sm">
        <Link href="/login" className="text-slate-400 transition-colors hover:text-cyan-300">
          ← Public login
        </Link>
      </div>
    </AuthShell>
  );
}
