"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { auth, firebaseConfigured, FIREBASE_MESSAGE } from "@/lib/firebase";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const oobCode = params.get("oobCode") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!oobCode || !auth) return;
    verifyPasswordResetCode(auth, oobCode)
      .then((e) => {
        setEmail(e);
        setChecked(true);
      })
      .catch(() => setError("This reset link is invalid or has expired."));
  }, [oobCode]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError(FIREBASE_MESSAGE);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message?.replace("Firebase: ", "") || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseConfigured) {
    return (
      <AuthShell title="Reset password" subtitle="Authentication is not configured.">
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">{FIREBASE_MESSAGE}</p>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="You can now log in with your new password.">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <Link href="/login" className="btn-primary mt-2 w-full">Go to login</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle={email ? `For ${email}` : "Verify your reset link to continue."}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 6 characters)" className="input-glass pl-10" />
        </div>
        {error && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
        {!checked && !error && <p className="text-xs text-slate-500">Validating your reset link…</p>}
        <button type="submit" disabled={loading || !checked} className="btn-primary w-full disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Reset password
        </button>
      </form>
    </AuthShell>
  );
}
