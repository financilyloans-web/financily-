"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Check,
  RotateCcw,
  X,
  Loader2,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  listCases,
  decideCase,
  caseStatusLabel,
  type CaseRecord,
  type CaseAction,
  type CaseStatus,
} from "@/lib/workflow";
import { formatINR, formatDate, cn } from "@/lib/utils";

const STATUS_FILTERS: { id: CaseStatus | ""; label: string }[] = [
  { id: "", label: "All" },
  { id: "new", label: "New" },
  { id: "under_review", label: "Under Review" },
  { id: "approved", label: "Approved" },
  { id: "rework", label: "Rework" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<CaseStatus, string> = {
  new: "bg-cyan-400/15 text-cyan-300",
  under_review: "bg-amber-400/15 text-amber-300",
  approved: "bg-emerald-400/15 text-emerald-300",
  rework: "bg-orange-400/15 text-orange-300",
  rejected: "bg-rose-400/15 text-rose-300",
};

interface CaseQueueProps {
  role: string;
  userEmail?: string | null;
}

export function CaseQueue({ role, userEmail }: CaseQueueProps) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CaseStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decisionOpen, setDecisionOpen] = useState<string | null>(null);
  const [decisionAction, setDecisionAction] = useState<CaseAction>("approve");
  const [remarks, setRemarks] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setCases(await listCases());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      if (filter && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.applicationNo.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.loanType.toLowerCase().includes(q)
      );
    });
  }, [cases, query, filter]);

  const openDecision = (c: CaseRecord, action: CaseAction) => {
    setDecisionOpen(c.id ?? null);
    setDecisionAction(action);
    setRemarks("");
  };

  const confirm = async (c: CaseRecord) => {
    if (!c.id) return;
    setBusyId(c.id);
    try {
      await decideCase(c.id, c, decisionAction, {
        remarks: decisionAction === "rework" ? remarks : remarks || undefined,
        user: userEmail ?? undefined,
        role,
      });
      setToast(
        `${c.applicationNo} ${decisionAction === "approve" ? "approved" : decisionAction === "reject" ? "rejected" : "sent for rework"}.`,
      );
      setDecisionOpen(null);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by app no, customer, city…"
            className="input-glass pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                filter === s.id
                  ? "bg-gradient-to-br from-primary-500 to-accent-600 text-white"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:text-white",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
          >
            <Check className="h-4 w-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* table */}
      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid min-h-[32vh] place-items-center rounded-3xl border border-dashed border-white/10 text-center">
          <div>
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 text-sm text-slate-400">No cases found.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">App No.</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Loan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <FragmentRow key={c.id} c={c} onAction={(action) => openDecision(c, action)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* decision modal */}
      <AnimatePresence>
        {decisionOpen && (() => {
          const c = cases.find((x) => x.id === decisionOpen);
          if (!c) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/70 p-4 backdrop-blur-sm"
              onClick={() => setDecisionOpen(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                className="surface-solid w-full max-w-md rounded-3xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-xl font-bold text-white">
                  {decisionAction === "approve" ? "Approve case" : decisionAction === "reject" ? "Reject case" : "Send for rework"}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {c.applicationNo} · {c.customerName}
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400">Loan</p>
                      <p className="font-semibold text-white">{c.loanType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Amount</p>
                      <p className="flex items-center gap-1 font-semibold text-white">
                        <IndianRupee className="h-3.5 w-3.5" /> {formatINR(c.loanAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="flex items-center gap-1 text-slate-300">
                        <MapPin className="h-3.5 w-3.5" /> {c.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Applied</p>
                      <p className="text-slate-300">{formatDate(c.createdAt?.toString())}</p>
                    </div>
                  </div>
                </div>

                <label className="mt-4 block text-sm font-medium text-slate-300">
                  Remarks {decisionAction === "rework" && <span className="text-rose-300">(required)</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder={decisionAction === "rework" ? "What needs to be reworked?" : "Optional note for the record"}
                  className="input-glass mt-2 resize-none"
                />

                <div className="mt-5 flex gap-2">
                  <button onClick={() => setDecisionOpen(null)} className="btn-ghost flex-1 px-4 py-2.5 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={() => confirm(c)}
                    disabled={busyId === c.id || (decisionAction === "rework" && !remarks.trim())}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50",
                      decisionAction === "approve" && "bg-gradient-to-br from-emerald-500 to-cyan-500",
                      decisionAction === "reject" && "bg-gradient-to-br from-rose-500 to-rose-600",
                      decisionAction === "rework" && "bg-gradient-to-br from-amber-500 to-orange-500",
                    )}
                  >
                    {busyId === c.id ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function FragmentRow({ c, onAction }: { c: CaseRecord; onAction: (a: CaseAction) => void }) {
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/5">
      <td className="px-4 py-3.5 font-mono text-xs text-cyan-300">{c.applicationNo}</td>
      <td className="px-4 py-3.5">
        <p className="font-semibold text-white">{c.customerName}</p>
        <p className="text-xs text-slate-400">{c.mobile}</p>
      </td>
      <td className="px-4 py-3.5 text-slate-300">{c.loanType}</td>
      <td className="px-4 py-3.5 font-semibold text-white">{formatINR(c.loanAmount)}</td>
      <td className="px-4 py-3.5">
        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_BADGE[c.status])}>
          {caseStatusLabel(c.status)}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <CaseActions c={c} onAction={onAction} />
      </td>
    </tr>
  );
}

function CaseActions({ c, onAction }: { c: CaseRecord; onAction: (a: CaseAction) => void }) {
  const canAct = c.status === "new" || c.status === "under_review" || c.status === "rework";
  if (!canAct) {
    return <span className="text-xs text-slate-500">No pending actions</span>;
  }
  return (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        title="Approve"
        aria-label="Approve"
        onClick={() => onAction("approve")}
        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-emerald-300 transition-all hover:bg-emerald-400/10"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Send rework"
        aria-label="Send rework"
        onClick={() => onAction("rework")}
        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-amber-300 transition-all hover:bg-amber-400/10"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Reject"
        aria-label="Reject"
        onClick={() => onAction("reject")}
        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-rose-300 transition-all hover:bg-rose-400/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
