"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, Check } from "lucide-react";
import { PINCodes } from "@/lib/pincodes";
import { cn } from "@/lib/utils";

interface PincodeSelectProps {
  value: string;
  city: string;
  state: string;
  onChange: (pin: string, city: string, state: string) => void;
  error?: string;
}

const MAX_RESULTS = 60;

export function PincodeSelect({ value, city, state, onChange, error }: PincodeSelectProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep the input in sync with the selected value from outside.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PINCodes.slice(0, MAX_RESULTS);
    const tokens = q.split(/\s+/).filter(Boolean);
    const out: typeof PINCodes = [];
    for (const pin of PINCodes) {
      const haystack = `${pin.p} ${pin.city} ${pin.state}`.toLowerCase();
      if (tokens.every((t) => haystack.includes(t))) {
        out.push(pin);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (pin: (typeof PINCodes)[number]) => {
    onChange(pin.p, pin.city, pin.state);
    setQuery(pin.p);
    setOpen(false);
  };

  const pick = (dir: 1 | -1) => {
    setHighlight((h) => {
      const next = (h + dir + matches.length) % matches.length;
      return next;
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      pick(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      pick(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[highlight]) select(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className={cn("input-glass pl-10", error && "border-rose-400/60")}
          value={query}
          placeholder="Search pincode or city…"
          inputMode="numeric"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="surface-solid absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl p-1.5"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-slate-400">
                No pincode found for “{query}”.
              </li>
            ) : (
              matches.map((pin, i) => {
                const active = i === highlight;
                const selected = pin.p === value;
                return (
                  <li key={pin.p}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => select(pin)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        active ? "bg-white/10 text-white" : "text-slate-300",
                      )}
                    >
                      <span className={cn("font-semibold tabular-nums", active ? "text-cyan-300" : "text-white")}>
                        {pin.p}
                      </span>
                      <span className="flex-1 truncate text-xs text-slate-400">
                        {pin.city}, {pin.state}
                      </span>
                      {selected && <Check className="h-4 w-4 text-emerald-300" />}
                    </button>
                  </li>
                );
              })
            )}
            {matches.length >= MAX_RESULTS && (
              <li className="border-t border-white/10 px-3 py-2 text-center text-[11px] text-slate-500">
                Showing top {MAX_RESULTS} results — type to narrow.
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      {city && state && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-300">
          <MapPin className="h-3 w-3" /> {city}, {state}
        </p>
      )}
    </div>
  );
}
