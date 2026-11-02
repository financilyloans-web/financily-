"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserRound,
  FileText,
  Gauge,
  Heart,
  Loader2,
  MailCheck,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FilePlus2,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUserApplications, getUserSavedRequests, generatePayToken, type LoanApplication } from "@/lib/firestore";
import { db, firebaseConfigured, FIREBASE_MESSAGE } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ButtonLink } from "@/components/ui/Button";
import { PayEmiButton } from "@/components/payments/PayEmiButton";
import { cn, formatINR, formatDate } from "@/lib/utils";

type Tab = "overview" | "profile" | "applications" | "eligibility" | "saved";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "applications", label: "Loan Applications", icon: FileText },
  { id: "eligibility", label: "Eligibility", icon: Gauge },
  { id: "saved", label: "Saved Requests", icon: Heart },
];

const statusMeta: Record<string, { label: string; cls: string; icon: any }> = {
  submitted: { label: "Submitted", cls: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10", icon: Clock },
  under_review: { label: "Under review", cls: "text-amber-300 border-amber-400/30 bg-amber-400/10", icon: Clock },
  offer_received: { label: "Offer received", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", icon: BadgeCheck },
  disbursed: { label: "Disbursed", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "text-rose-300 border-rose-400/30 bg-rose-400/10", icon: FilePlus2 },
};

export function DashboardInner() {
  const { user, configured, sendVerification, isVerified, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  const loadData = useCallback(async () => {
    if (!configured || !user) return;
    setLoadingData(true);
    try {
      const [apps, reqs] = await Promise.all([getUserApplications(user.uid), getUserSavedRequests(user.uid)]);
      setApplications(apps);
      setSaved(reqs);
    } catch {
      /* ignore */
    } finally {
      setLoadingData(false);
    }
  }, [configured, user]);

  useEffect(() => {
    if (tab === "applications" || tab === "saved") loadData();
  }, [tab, loadData]);

  // Backfill a payToken for any loan created before tokens existed, so the
  // anonymous Pay-EMI order id is always resolvable. Owner writes are allowed by
  // the Firestore rules, so this runs client-side.
  useEffect(() => {
    if (!configured || !db || !user?.uid || !applications.length) return;
    const firestore = db;
    const uid = user.uid;
    let changed = false;
    const next = applications.map((a) => {
      if (a.payToken || !a.id) return a;
      changed = true;
      const payToken = generatePayToken();
      // Must include `uid` — the Firestore rules require uid == auth.uid on
      // every application write, or the backfill is silently denied.
      updateDoc(doc(firestore, "users", uid, "applications", a.id), { uid, payToken }).catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("[dashboard] payToken backfill failed:", e);
      });
      return { ...a, payToken };
    });
    if (changed) setApplications(next);
  }, [configured, user, applications]);

  const resendVerification = async () => {
    setVerifyMsg("");
    try {
      await sendVerification();
      setVerifyMsg("Verification email sent. Please check your inbox.");
    } catch (e: any) {
      setVerifyMsg(e?.message || "Could not send verification email.");
    }
  };

  if (!configured) {
    return (
      <div className="section-shell py-10">
        <div className="glass max-w-2xl rounded-3xl p-8">
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-3 text-sm text-slate-300">{FIREBASE_MESSAGE}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Pay EMI requires admin enablement (emiEligible) and pays the admin-set
  // amount. The order is keyed by the loan's random payToken.
  const activeLoan = applications.find((a) => a.emiEligible === true && a.payToken && Number(a.emiAmount) > 0);

  return (
    <div className="section-shell py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Hello, {user.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isVerified && (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300">
              <MailCheck className="h-3.5 w-3.5" /> Unverified
            </span>
          )}
          <button onClick={logout} className="btn-ghost px-4 py-2 text-sm">Logout</button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
              tab === t.id
                ? "bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg"
                : "border border-white/10 bg-white/5 text-slate-300 hover:text-white",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {tab === "overview" && (
      <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard icon={FileText} label="Applications" value={String(applications.length || 0)} />
              <StatCard icon={BadgeCheck} label="Active offers" value={String(applications.filter((a) => a.status === "offer_received").length || 0)} />
              <StatCard icon={CheckCircle2} label="Disbursed" value={String(applications.filter((a) => a.status === "disbursed").length || 0)} />
              <div className="glass rounded-3xl p-6 md:col-span-2">
                <h3 className="font-display text-lg font-bold text-white">Quick actions</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ButtonLink href="/apply">New application</ButtonLink>
                  <ButtonLink href="/eligibility-checker" variant="ghost">Check eligibility</ButtonLink>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 md:col-span-2">
              <h3 className="font-display text-lg font-bold text-white">Pay your EMI</h3>
              <p className="mt-1 text-sm text-slate-400">
                Make a UPI payment directly to your lender. Financily merely
                facilitates the checkout — funds go straight to the lender.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {activeLoan ? (
                  <PayEmiButton
                    orderId={`EMI-${activeLoan.payToken}`}
                    amount={Math.round(Number(activeLoan.emiAmount))}
                    description={`EMI for ${activeLoan.refNumber || activeLoan.id}`}
                    customer={{ name: activeLoan.fullName, email: activeLoan.email }}
                  />
                ) : (
                  <p className="text-sm text-slate-400">
                    No loan applications yet — once you have an approved loan, your
                    EMI pay button appears here.
                  </p>
                )}
                <ButtonLink href="/eligibility-checker" variant="ghost" size="sm">How EMI works</ButtonLink>
              </div>
            </div>
      </>
          )}

          {tab === "profile" && (
            <div className="glass max-w-2xl rounded-3xl p-7">
              <h3 className="font-display text-lg font-bold text-white">Profile details</h3>
              <div className="mt-5 space-y-4 text-sm">
                <Row label="Name" value={user.displayName || "—"} />
                <Row label="Email" value={user.email || "—"} />
                <Row label="Email verified" value={isVerified ? "Yes" : "No"} />
                <Row label="Provider" value={user.providerData?.[0]?.providerId || "email"} />
                <Row label="Member since" value={formatDate(user.metadata.creationTime)} />
              </div>
              {!isVerified && (
                <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                  <p className="text-sm text-amber-200">Please verify your email address to unlock all features.</p>
                  <button onClick={resendVerification} className="btn-primary mt-3 px-4 py-2 text-sm">Resend verification email</button>
                  {verifyMsg && <p className="mt-2 text-xs text-amber-200">{verifyMsg}</p>}
                </div>
              )}
            </div>
          )}

          {tab === "applications" && (
            <div className="space-y-4">
              {loadingData && <CenterLoader />}
              {!loadingData && applications.length === 0 && (
                <EmptyState
                  title="No applications yet"
                  text="Start a new loan application to see it tracked here."
                  action={<ButtonLink href="/apply">Start application <ArrowRight className="h-4 w-4" /></ButtonLink>}
                />
              )}
              {applications.map((a) => {
                const meta = statusMeta[a.status] || statusMeta.submitted;
                return (
                  <div key={a.id} className="glass rounded-3xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold text-white">{a.fullName}</p>
                        <p className="text-sm text-slate-400">{formatINR(a.loanAmount)} · {a.purpose} · {a.city}</p>
                      </div>
                      <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", meta.cls)}>
                        <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <Detail label="Status" value={meta.label} />
                      <Detail label="Submitted" value={formatDate(String(a.createdAt))} />
                      <Detail label="Lender" value={a.lender || "Pending match"} />
                      <Detail label="Offered rate" value={a.offerRate ? `${a.offerRate}%` : "—"} />
                      </div>
                      {a.emiEligible === true && a.payToken && Number(a.emiAmount) > 0 && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-emerald-300">Pay EMI</p>
                            <p className="text-xs text-slate-400">Pay your monthly instalment via UPI</p>
                          </div>
                          <PayEmiButton
                            variant="ghost"
                            size="sm"
                            orderId={`EMI-${a.payToken}`}
                            amount={Math.round(Number(a.emiAmount))}
                            description={`EMI for ${a.refNumber || a.id}`}
                            customer={{ name: a.fullName, email: a.email }}
                          />
                        </div>
                      )}
                    </div>
                );
              })}
            </div>
          )}

          {tab === "eligibility" && (
            <div className="glass max-w-2xl rounded-3xl p-7">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white"><Gauge className="h-5 w-5 text-cyan-300" /> Eligibility status</h3>
              <p className="mt-3 text-sm text-slate-300">
                Your eligibility depends on income, credit score, employment and existing obligations.
                Get a real-time estimate with our checker.
              </p>
              <div className="mt-5 space-y-3">
                <CheckRow text="Score 750+ unlocks the best offers" />
                <CheckRow text="Keep existing EMIs under 50% of income" />
                <CheckRow text="Paperless KYC speeds up approval" />
              </div>
              <ButtonLink href="/eligibility-checker" className="mt-6">Run eligibility check <ArrowRight className="h-4 w-4" /></ButtonLink>
            </div>
          )}

          {tab === "saved" && (
            <div className="space-y-4">
              {loadingData && <CenterLoader />}
              {!loadingData && saved.length === 0 && (
                <EmptyState title="No saved requests" text="Requests you save will appear here for quick follow-up." />
              )}
              {saved.map((s) => (
                <div key={s.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
                  <div>
                    <p className="font-display text-lg font-bold text-white">{formatINR(s.loanAmount)}</p>
                    <p className="text-sm text-slate-400">{s.purpose} · saved {formatDate(String(s.savedAt))}</p>
                  </div>
                  <ButtonLink href="/apply" variant="ghost" size="sm">Apply now</ButtonLink>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass rounded-3xl p-6">
      <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-white">{value}</p>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> {text}
    </div>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-3xl p-10 text-center">
      <FilePlus2 className="h-10 w-10 text-slate-500" />
      <p className="font-display text-lg font-bold text-white">{title}</p>
      <p className="max-w-sm text-sm text-slate-400">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function CenterLoader() {
  return <div className="grid place-items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></div>;
}
