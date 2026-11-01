"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";
import { getStaffRole, type StaffRole } from "@/lib/staff";
import { listCases, caseStatusLabel, type CaseStatus } from "@/lib/workflow";
import { CaseQueue } from "./CaseQueue";
import { AuditTrail } from "./AuditTrail";
import { Counter } from "@/components/effects/Counter";
import { LogOut, Briefcase, UserCog, ShieldCheck, LayoutDashboard, FolderKanban, History } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";

type Tab = "overview" | "cases" | "audit";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "cases", label: "Cases", icon: FolderKanban },
  { id: "audit", label: "Audit Trail", icon: History },
];

export function StaffDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<StaffRole | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [cases, setCases] = useState<Awaited<ReturnType<typeof listCases>>>([]);

  useEffect(() => {
    let cancelled = false;
    const resolveRole = async () => {
      if (!user?.email) {
        if (!cancelled) {
          setRole(null);
          setChecked(true);
        }
        return;
      }
      const provisioned = await getStaffRole(user.email);
      if (!cancelled) {
        setRole(provisioned);
        setChecked(true);
      }
    };
    resolveRole();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  useEffect(() => {
    if (checked && role) {
      listCases().then(setCases).catch(() => setCases([]));
    }
  }, [checked, role]);

  const signOut = async () => {
    sessionStorage.removeItem("financily_staff_role");
    await logout();
    router.replace("/staff-login");
  };

  const isAgent = role === "agent";

  const total = cases.length;
  const pending = cases.filter((c) => c.status === "new" || c.status === "under_review").length;
  const approved = cases.filter((c) => c.status === "approved").length;
  const rework = cases.filter((c) => c.status === "rework").length;
  const rejected = cases.filter((c) => c.status === "rejected").length;
  const totalSanction = cases.filter((c) => c.status === "approved").reduce((s, c) => s + c.loanAmount, 0);
  const totalVolume = cases.reduce((s, c) => s + c.loanAmount, 0);

  const kpiCards = [
    { label: "Total Cases", value: total, suffix: "", tone: "text-white" },
    { label: "Pending Review", value: pending, suffix: "", tone: "text-amber-300" },
    { label: "Approved", value: approved, suffix: "", tone: "text-emerald-300" },
    { label: "Rework", value: rework, suffix: "", tone: "text-orange-300" },
    { label: "Rejected", value: rejected, suffix: "", tone: "text-rose-300" },
  ];

  return (
    <RequireAuth>
      <div className="section-shell py-10">
        <div className="surface-solid rounded-[2rem] p-6 sm:p-8">
          {!checked ? (
            <div className="grid min-h-[50vh] place-items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
            </div>
          ) : !role ? (
            <div className="text-center py-16">
              <ShieldCheck className="mx-auto h-10 w-10 text-rose-300" />
              <h1 className="mt-4 font-display text-xl font-bold text-white">Access not provisioned</h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
                This account is not registered in the internal staff roster. Contact
                Financily admin to assign you an Agent or Employee role.
              </p>
              <button onClick={signOut} className="btn-primary mt-6 px-5 py-2.5 text-sm">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <>
              {/* header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg">
                    {isAgent ? <Briefcase className="h-6 w-6" /> : <UserCog className="h-6 w-6" />}
                  </span>
                  <div>
                    <h1 className="font-display text-xl font-bold text-white">
                      {isAgent ? "Agent Portal" : "Employee Portal"}
                    </h1>
                    <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" /> Signed in as {isAgent ? "agent" : "employee"} · {user?.email}
                    </p>
                  </div>
                </div>
                <button onClick={signOut} className="btn-ghost px-4 py-2 text-sm">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>

              {/* tabs */}
              <div className="mt-6 flex flex-wrap gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                      tab === t.id
                        ? "bg-gradient-to-br from-primary-500 to-accent-600 text-white"
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="mt-6"
                >
                  {tab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {kpiCards.map((c) => (
                          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs text-slate-400">{c.label}</p>
                            <p className={cn("mt-1 font-display text-2xl font-bold", c.tone)}>
                              <Counter to={c.value} suffix={c.suffix} />
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                          <p className="text-xs text-slate-400">Total Sanction Approved</p>
                          <p className="mt-1 font-display text-2xl font-bold text-white">
                            {formatINR(totalSanction)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                          <p className="text-xs text-slate-400">Pipeline Volume (all cases)</p>
                          <p className="mt-1 font-display text-2xl font-bold text-white">
                            {formatINR(totalVolume)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-semibold text-white">Recent statuses</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(["new", "under_review", "approved", "rework", "rejected"] as CaseStatus[]).map((s) => {
                            const count = cases.filter((c) => c.status === s).length;
                            return (
                              <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                {caseStatusLabel(s)} · {count}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "cases" && <CaseQueue role={isAgent ? "agent" : "employee"} userEmail={user?.email} />}
                  {tab === "audit" && <AuditTrail />}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
