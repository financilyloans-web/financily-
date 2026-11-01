"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, ShieldCheck, Check, RotateCcw, X, PlusCircle } from "lucide-react";
import { getWorkflowHistory, type WorkflowEvent } from "@/lib/workflow";
import { formatDate, cn } from "@/lib/utils";

const ACTION_META: Record<string, { icon: typeof Check; tint: string; label: string }> = {
  APPROVED: { icon: Check, tint: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30", label: "Approved" },
  REJECTED: { icon: X, tint: "text-rose-300 bg-rose-400/10 border-rose-400/30", label: "Rejected" },
  REWORK: { icon: RotateCcw, tint: "text-amber-300 bg-amber-400/10 border-amber-400/30", label: "Sent for rework" },
  CREATED: { icon: PlusCircle, tint: "text-cyan-300 bg-cyan-400/10 border-cyan-400/30", label: "Case created" },
};

export function AuditTrail() {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setEvents(await getWorkflowHistory());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.applicationNo.toLowerCase().includes(q) ||
        (e.action || "").toLowerCase().includes(q) ||
        (e.user || "").toLowerCase().includes(q),
    );
  }, [events, query]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by app no, action, user…"
          className="input-glass pl-10"
        />
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid min-h-[32vh] place-items-center rounded-3xl border border-dashed border-white/10 text-center">
          <div>
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 text-sm text-slate-400">No workflow activity yet.</p>
          </div>
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-white/10 pl-6">
          {filtered.map((e, i) => {
            const meta = ACTION_META[e.action] ?? { icon: ShieldCheck, tint: "text-slate-300 bg-white/5 border-white/10", label: e.action || "Event" };
            const MetaIcon = meta.icon;
            return (
              <li key={e.id ?? `${e.applicationNo}-${e.createdAt}-${i}`} className="relative">
                <span className={cn("absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full border text-[10px]", meta.tint)}>
                  <MetaIcon className="h-3 w-3" />
                </span>
                <div className="surface-solid rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-cyan-300">{e.applicationNo}</p>
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", meta.tint)}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>{e.user || "system"}</span>
                    {e.role && <span>· {e.role}</span>}
                    <span>· {formatDate(e.createdAt?.toString())}</span>
                  </div>
                  {e.newStatus && (
                    <p className="mt-2 text-xs text-slate-400">
                      Status: <span className="font-semibold text-white">{e.newStatus}</span>
                      {e.oldStatus && (
                        <> <span className="text-slate-500">(was {e.oldStatus})</span></>
                      )}
                    </p>
                  )}
                  {e.remarks && (
                    <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                      {e.remarks}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
