"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Loader2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSearch,
  Copy,
  Check,
} from "lucide-react";
import { getAllCustomerApplications, type LoanApplication } from "@/lib/firestore";
import { cn, formatINR } from "@/lib/utils";

type SortKey = "createdAt" | "loanAmount" | "fullName" | "status";
type SortDir = "asc" | "desc";

const STATUS_META: Record<LoanApplication["status"], { label: string; cls: string }> = {
  submitted: { label: "Submitted", cls: "bg-sky-400/15 text-sky-300 border-sky-400/30" },
  under_review: { label: "Under Review", cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
  offer_received: { label: "Offer Received", cls: "bg-violet-400/15 text-violet-300 border-violet-400/30" },
  disbursed: { label: "Disbursed", cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" },
  rejected: { label: "Rejected", cls: "bg-rose-400/15 text-rose-300 border-rose-400/30" },
};

function toDate(ts?: LoanApplication["createdAt"]): number {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  try {
    return ts.toMillis();
  } catch {
    return 0;
  }
}

function fmtDate(ts?: LoanApplication["createdAt"]): string {
  const t = toDate(ts);
  if (!t) return "—";
  return new Date(t).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CustomerApplications() {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LoanApplication["status"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<LoanApplication | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setApps(await getAllCustomerApplications());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = apps;
    if (q) {
      list = list.filter((a) =>
        [a.fullName, a.email, a.mobile, a.refNumber, a.purpose]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === "createdAt") return (toDate(a.createdAt) - toDate(b.createdAt)) * dir;
      if (sortKey === "loanAmount") return (a.loanAmount - b.loanAmount) * dir;
      if (sortKey === "fullName") return a.fullName.localeCompare(b.fullName) * dir;
      return (a.status || "").localeCompare(b.status || "") * dir;
    });
  }, [apps, query, statusFilter, sortKey, sortDir]);

  const copyRef = () => {
    if (!selected?.refNumber) return;
    navigator.clipboard?.writeText(selected.refNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />;
    return sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-cyan-300" /> : <ArrowDown className="h-3.5 w-3.5 text-cyan-300" />;
  };

  const th = (k: SortKey, label: string) => (
    <th>
      <button
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1.5 font-semibold hover:text-cyan-300"
      >
        {label} <SortIcon k={k} />
      </button>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, mobile or Ref No…"
            className="input-glass pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === "all"
                ? "border-cyan-400 bg-gradient-to-br from-primary-500 to-accent-600 text-white"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/50 hover:text-white",
            )}
          >
            All
          </button>
          {(Object.keys(STATUS_META) as LoanApplication["status"][]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === s
                  ? "border-cyan-400 bg-gradient-to-br from-primary-500 to-accent-600 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/50 hover:text-white",
              )}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="grid min-h-[300px] place-items-center">
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              Loading applications…
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="grid min-h-[300px] place-items-center text-center">
            <div>
              <FileSearch className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-3 font-semibold text-white">No applications found</p>
              <p className="mt-1 text-sm text-slate-400">
                {apps.length ? "Try a different search or status filter." : "No customer loan applications have been submitted yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Ref No.</th>
                  {th("fullName", "Customer")}
                  <th className="hidden md:table-cell px-4 py-3">Contact</th>
                  {th("loanAmount", "Amount")}
                  {th("createdAt", "Date")}
                  {th("status", "Status")}
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((a) => {
                  const st = STATUS_META[a.status] ?? STATUS_META.submitted;
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(a)}
                          className="font-mono text-xs font-bold text-cyan-300 underline-offset-2 hover:underline"
                        >
                          {a.refNumber || "—"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{a.fullName}</p>
                        <p className="text-xs text-slate-400">{a.employmentType === "salaried" ? "Salaried" : "Self-employed"} · {a.city || "—"}</p>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <p className="text-slate-300">{a.email || "—"}</p>
                        <p className="text-xs text-slate-400">{a.mobile || "—"}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{formatINR(a.loanAmount)}</td>
                      <td className="px-4 py-3 text-slate-300">{fmtDate(a.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold", st.cls)}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(a)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Showing {rows.length} of {apps.length} application{apps.length === 1 ? "" : "s"}. Click a Ref No. or View to open full details.
      </p>

      {/* detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-sm font-bold text-cyan-300">
                      {selected.refNumber || "No ref"}
                    </span>
                    {selected.refNumber && (
                      <button
                        onClick={copyRef}
                        className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-slate-400 hover:text-cyan-300"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Application ID · {selected.id}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3">
                <StatusBadge status={selected.status} />
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Section title="Personal">
                  <Row k="Full name" v={selected.fullName} />
                  <Row k="Mobile" v={selected.mobile} />
                  <Row k="Email" v={selected.email} />
                  <Row k="Date of birth" v={selected.dob} />
                </Section>

                <Section title="Employment">
                  <Row k="Type" v={selected.employmentType === "salaried" ? "Salaried" : "Self-employed"} />
                  <Row k="Company" v={selected.companyName} />
                  <Row k="Monthly income" v={formatINR(selected.monthlyIncome)} />
                </Section>

                <Section title="Loan">
                  <Row k="Amount requested" v={formatINR(selected.loanAmount)} />
                  <Row k="Purpose" v={selected.purpose} />
                  <Row k="Status" v={STATUS_META[selected.status]?.label ?? selected.status} />
                  {selected.lender && <Row k="Lender" v={selected.lender} />}
                  {selected.offerRate != null && <Row k="Offer rate" v={`${selected.offerRate}% p.a.`} />}
                </Section>

                <Section title="Address">
                  <Row k="Address" v={[selected.addressLine1, selected.addressLine2].filter(Boolean).join(", ")} />
                  <Row k="City / State" v={`${selected.city}, ${selected.state}`} />
                  <Row k="Pincode" v={selected.pincode} />
                </Section>

                <Section title="Identity (masked)">
                  <Row k="PAN" v={selected.panMasked || "—"} />
                  <Row k="Aadhaar" v={selected.aadhaarMasked || "—"} />
                  <Row k="KYC captured" v={selected.kycStoredAt ? fmtDate(selected.kycStoredAt) : "—"} />
                </Section>

                <Section title="Meta">
                  <Row k="Submitted" v={fmtDate(selected.createdAt)} />
                  {selected.uid && <Row k="Linked account UID" v={selected.uid} />}
                </Section>
              </div>

              <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-300">
                Only masked identity values and hashes are stored. Raw PAN / Aadhaar are never persisted or shown.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: LoanApplication["status"] }) {
  const st = STATUS_META[status] ?? STATUS_META.submitted;
  return (
    <span className={cn("inline-block rounded-full border px-3 py-1 text-xs font-semibold", st.cls)}>
      {st.label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h4>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-xs font-medium text-slate-400">{k}</span>
      <span className="text-right text-sm font-medium text-white">{v || "—"}</span>
    </div>
  );
}
