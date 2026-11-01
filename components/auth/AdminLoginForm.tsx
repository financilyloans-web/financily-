"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { useAuth } from "./AuthProvider";
import { getStaffRole } from "@/lib/staff";

export function AdminLoginForm() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      const provisioned = await getStaffRole(user.email ?? email);

      if (provisioned !== "admin") {
        setError(
          provisioned
            ? "This account is not an admin. Admins must sign in here."
            : "This account is not provisioned as an admin. Contact the platform owner to assign admin access.",
        );
        return;
      }

      sessionStorage.setItem("financily_staff_role", "admin");
      router.replace("/admin");
    } catch (err: any) {
      setError(err?.message?.replace("Firebase: ", "") || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Admin Login" subtitle="Restricted to Financily platform admins">
      <div className="mb-6 flex items-start gap-2 rounded-2xl border border-primary-400/30 bg-primary-400/10 p-3 text-xs text-primary-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Admin access is used to create and manage employee / agent accounts.
          Only admin-provisioned accounts can enter.
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email address"
            className="input-glass pl-10"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-glass pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            aria-label="Toggle password"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Sign in as Admin"
          )}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] text-slate-400">
        No self-registration. Admin credentials are issued by the platform owner only.
      </div>
    </AuthShell>
  );
}
