"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ShieldCheck, LogOut, Loader2, UserPlus, Mail, Lock, Briefcase,
  UserCog, CheckCircle2, AlertTriangle, Users, KeyRound, Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { getStaffRole, STAFF_ROLE_LABELS, type StaffRole } from "@/lib/staff";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { EmiPaymentsPanel } from "./EmiPaymentsPanel";

interface RosterEntry {
  email: string;
  role: StaffRole;
}

const TARGET_ROLES: StaffRole[] = ["agent", "employee"];

function getErrorMessage(err: any): string {
  const msg = err?.error || err?.message || "";
  return msg.replace(/^Firebase:\s*/, "") || "Something went wrong.";
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<StaffRole | null>(null);
  const [checked, setChecked] = useState(false);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState<StaffRole>("agent");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.email) {
        if (!cancelled) { setRole(null); setChecked(true); }
        return;
      }
      const provisioned = await getStaffRole(user.email);
      if (!cancelled) { setRole(provisioned); setChecked(true); }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const loadRoster = useCallback(async () => {
    if (!db) return;
    setLoadingRoster(true);
    try {
      const snap = await getDocs(query(collection(db, "staff")));
      const rows = snap.docs.map((d) => ({
        email: d.id,
        role: (d.data().role as StaffRole) || "employee",
      }));
      rows.sort((a, b) => a.email.localeCompare(b.email));
      setRoster(rows);
    } catch {
      setRoster([]);
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    if (role === "admin") loadRoster();
  }, [role, loadRoster]);

  const signOut = async () => {
    sessionStorage.removeItem("financily_staff_role");
    await logout();
    router.replace("/admin-login");
  };

  const provision = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const idToken = await user?.getIdToken(true);
      if (!idToken) throw new Error("Not authenticated.");
      const res = await fetch("/api/admin/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ email, password, role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Provisioning failed.");
      setMessage({ ok: true, text: `✔ ${data.email} provisioned as ${data.roleLabel}.` });
      setEmail("");
      setPassword("");
      loadRoster();
    } catch (err: any) {
      setMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const removeStaff = async (emailToRemove: string) => {
    if (!window.confirm(`Remove ${emailToRemove}? This permanently deletes their login and roster entry.`)) {
      return;
    }
    setMessage(null);
    setRemoving(emailToRemove);
    try {
      const idToken = await user?.getIdToken(true);
      if (!idToken) throw new Error("Not authenticated.");
      const res = await fetch("/api/admin/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ email: emailToRemove }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Removal failed.");
      setMessage({ ok: true, text: `✔ ${data.email} removed.` });
      loadRoster();
    } catch (err: any) {
      setMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setRemoving(null);
    }
  };

  if (!checked) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="section-shell py-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-rose-300" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Admin access only</h1>
          <p className="mt-2 text-sm text-slate-300">
            You must be provisioned as an admin to manage staff accounts.
          </p>
          <button onClick={() => router.replace("/admin-login")} className="btn-primary mt-6 w-full">
            Go to Admin Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="section-shell py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-white">Admin Portal</h1>
                <p className="text-xs text-emerald-300">Signed in as admin · {user?.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="btn-ghost px-4 py-2 text-sm">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[400px_1fr]">
            {/* Create credentials */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-300" />
                <h2 className="font-display text-lg font-bold text-white">Create staff account</h2>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Issue an email + password for an employee or agent. Both the
                login credential and the roster entry are created.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {TARGET_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition-all",
                      targetRole === r
                        ? "border-cyan-400/50 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:border-white/20",
                    )}
                  >
                    {r === "agent" ? (
                      <Briefcase className="h-5 w-5 text-slate-400" />
                    ) : (
                      <UserCog className="h-5 w-5 text-slate-400" />
                    )}
                    <span className="mt-1.5 block text-sm font-semibold text-white">
                      {STAFF_ROLE_LABELS[r]}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={provision} className="mt-5 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@financily.in"
                    className="input-glass pl-10"
                  />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Temporary password (≥6 chars)"
                    className="input-glass pl-10"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Create account
                    </>
                  )}
                </button>
              </form>

              {message && (
                <div className={cn("mt-4 flex items-start gap-2 rounded-2xl border p-3 text-xs", message.ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300")}>
                  {message.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}
            </div>

            {/* Roster */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-300" />
                  <h2 className="font-display text-lg font-bold text-white">Staff roster</h2>
                </div>
                {loadingRoster && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </div>

              {roster.length === 0 ? (
                <p className="mt-6 text-sm text-slate-400">
                  No staff accounts yet. Use the form to create the first one.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {roster.map((entry) => (
                    <div key={entry.email} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("grid h-9 w-9 place-items-center rounded-xl text-white", entry.role === "admin" ? "bg-gradient-to-br from-primary-500 to-accent-600" : entry.role === "agent" ? "bg-gradient-to-br from-cyan-500 to-primary-500" : "bg-gradient-to-br from-accent-500 to-fuchsia-500")}>
                          {entry.role === "admin" ? <ShieldCheck className="h-4 w-4" /> : entry.role === "agent" ? <Briefcase className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{entry.email}</p>
                          <p className="text-xs text-slate-400">Role: {STAFF_ROLE_LABELS[entry.role]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", entry.role === "admin" ? "bg-primary-400/15 text-primary-300" : entry.role === "agent" ? "bg-cyan-400/15 text-cyan-300" : "bg-accent-500/15 text-accent-300")}>
                          {STAFF_ROLE_LABELS[entry.role]}
                        </span>
                        {entry.role !== "admin" && entry.email !== user?.email && (
                          <button
                            onClick={() => removeStaff(entry.email)}
                            disabled={removing === entry.email}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-rose-400/30 bg-rose-400/10 text-rose-300 transition-colors hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Remove ${entry.email}`}
                            title="Remove account"
                          >
                            {removing === entry.email ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        <div className="section-shell pb-10 pt-4">
          <EmiPaymentsPanel />
        </div>
    </RequireAuth>
  );
}
