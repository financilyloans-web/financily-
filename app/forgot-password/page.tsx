"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, Send } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ForgotPasswordPage() {
  const { sendReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message?.replace("Firebase: ", "") || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-sm text-slate-200">
            If an account exists for <span className="font-semibold text-white">{email}</span>, a reset link is on its way.
          </p>
          <Link href="/login" className="btn-primary mt-2 w-full">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="input-glass pl-10" />
          </div>
          {error && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send reset link
          </button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-slate-400 hover:text-cyan-300">← Back to login</Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
