"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { useAuth } from "./AuthProvider";

export function LoginForm() {
  const { signInWithEmail, signInWithGoogle, configured } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

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
      await signInWithEmail(email, password);
      router.push(next);
    } catch (err: any) {
      setError(err?.message?.replace("Firebase: ", "") || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(next);
    } catch (err: any) {
      setError(err?.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your loan applications and offers.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="input-glass pl-10" />
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
          Login
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
      </div>

      <button onClick={google} disabled={loading || !configured} className="btn-ghost w-full disabled:opacity-60">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </button>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-cyan-300 hover:text-cyan-200">Forgot password?</Link>
        <Link href="/signup" className="font-semibold text-white hover:text-cyan-200">Create account</Link>
      </div>
    </AuthShell>
  );
}
