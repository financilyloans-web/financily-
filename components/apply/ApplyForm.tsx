"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  Briefcase,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { saveApplication } from "@/lib/firestore";
import { firebaseConfigured } from "@/lib/firebase";
import { ButtonLink } from "@/components/ui/Button";
import { cn, formatINR } from "@/lib/utils";

const STEPS = [
  { id: 0, label: "Personal", icon: UserRound },
  { id: 1, label: "Employment", icon: Briefcase },
  { id: 2, label: "Loan", icon: Banknote },
  { id: 3, label: "Consent", icon: ShieldCheck },
];

const INITIAL = {
  fullName: "",
  mobile: "",
  email: "",
  dob: "",
  employmentType: "salaried" as "salaried" | "self-employed",
  companyName: "",
  monthlyIncome: "",
  loanAmount: "300000",
  purpose: "Medical Emergency",
  city: "",
  consentPrivacy: false,
  consentTerms: false,
  consentShare: false,
  notRobot: false,
};

export function ApplyForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...INITIAL });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (): string | null => {
    if (step === 0) {
      if (form.fullName.trim().length < 3) return "Please enter your full name.";
      if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Enter a valid 10-digit Indian mobile number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
      if (!form.dob) return "Please enter your date of birth.";
    }
    if (step === 1) {
      if (form.companyName.trim().length < 2) return "Please enter your company or business name.";
      const income = Number(form.monthlyIncome);
      if (!income || income < 15000) return "Monthly income should be at least ₹15,000.";
    }
    if (step === 2) {
      if (!form.city.trim()) return "Please enter your city.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    if (!form.consentPrivacy || !form.consentTerms || !form.consentShare) {
      setError("Please accept all consents to continue.");
      return;
    }
    if (!form.notRobot) {
      setError("Please confirm you are not a robot.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        uid: user?.uid || "guest",
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        dob: form.dob,
        employmentType: form.employmentType,
        companyName: form.companyName,
        monthlyIncome: Number(form.monthlyIncome),
        loanAmount: Number(form.loanAmount),
        purpose: form.purpose,
        city: form.city,
        status: "submitted" as const,
        lender: undefined,
        offerRate: undefined,
      };

      let ref = "LOCAL";
      if (firebaseConfigured && user) {
        ref = await saveApplication(payload);
      } else {
        const store = JSON.parse(localStorage.getItem("financily_applications") || "[]");
        store.unshift({ ...payload, id: `local_${Date.now()}`, createdAt: new Date().toISOString() });
        localStorage.setItem("financily_applications", JSON.stringify(store));
      }
      setSubmitted(ref);
      setStep(3);
    } catch (e: any) {
      setError(e?.message || "Something went wrong submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-[2rem] p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h2 className="mt-4 font-display text-2xl font-bold text-white">Application received!</h2>
          <p className="mt-3 text-slate-300">
            Thank you, {form.fullName.split(" ")[0]}. We&apos;re now matching you with
            lenders. Your reference ID is{" "}
            <span className="font-mono text-cyan-300">{submitted}</span>.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            You&apos;ll be contacted on {form.mobile} and {form.email}. Final approval is
            decided solely by the lender.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/dashboard" variant="ghost">Go to dashboard</ButtonLink>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <div className="mb-6 flex items-center justify-between">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition-all",
                  step === s.id
                    ? "border-cyan-400/60 bg-gradient-to-br from-primary-500 to-accent-600 text-white"
                    : step > s.id
                      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                      : "border-white/10 bg-white/5 text-slate-400",
                )}
              >
                {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
              </span>
              <span className={cn("text-[11px] font-medium", step >= s.id ? "text-white" : "text-slate-500")}>{s.label}</span>
            </div>
            {s.id < 3 && <div className={cn("mx-1 h-px flex-1", step > s.id ? "bg-emerald-400/50" : "bg-white/10")} />}
          </div>
        ))}
      </div>

      <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Personal details</h2>
                <Field label="Full name">
                  <input className="input-glass" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="As per PAN / Aadhaar" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mobile number">
                    <input className="input-glass" inputMode="numeric" maxLength={10} value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" />
                  </Field>
                  <Field label="Email">
                    <input type="email" className="input-glass" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                  </Field>
                </div>
                <Field label="Date of birth">
                  <input type="date" className="input-glass" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Employment details</h2>
                <div className="grid grid-cols-2 gap-2">
                  {(["salaried", "self-employed"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("employmentType", t)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                        form.employmentType === t ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/5 text-slate-300",
                      )}
                    >
                      {t === "salaried" ? "Salaried" : "Self-employed"}
                    </button>
                  ))}
                </div>
                <Field label={form.employmentType === "salaried" ? "Company name" : "Business name"}>
                  <input className="input-glass" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder={form.employmentType === "salaried" ? "e.g. Tech Corp Pvt Ltd" : "e.g. My Retail Store"} />
                </Field>
                <Field label="Monthly income (₹)">
                  <input className="input-glass" type="number" min={15000} value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} placeholder="e.g. 60000" />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white">Loan details</h2>
                <Field label={`Loan amount — ${formatINR(Number(form.loanAmount || 0))}`}>
                  <input type="range" min={50000} max={5000000} step={10000} value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400" />
                </Field>
                <Field label="Purpose">
                  <select className="input-glass" value={form.purpose} onChange={(e) => set("purpose", e.target.value)}>
                    {["Medical Emergency", "Marriage", "Education", "Home Renovation", "Debt Consolidation", "Travel", "Business", "Other"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="City">
                  <input className="input-glass" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Mumbai" />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-white">Consent &amp; submit</h2>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 text-xs leading-relaxed text-slate-300">
                  <strong className="text-amber-200">Important disclaimer:</strong> Financily is not a
                  lender, financial institution, bank, or NBFC. Financily is a loan aggregation platform
                  that connects borrowers with approved third-party lending partners. Loan approval,
                  interest rates, processing fees, eligibility, and final terms are solely determined
                  by the respective lender.
                </div>

                <ConsentCheck checked={form.consentPrivacy} onChange={(v) => set("consentPrivacy", v)} label="I agree to the Privacy Policy." />
                <ConsentCheck checked={form.consentTerms} onChange={(v) => set("consentTerms", v)} label="I agree to the Terms & Conditions." />
                <ConsentCheck checked={form.consentShare} onChange={(v) => set("consentShare", v)} label="I consent to share my data with lending partners." />
                <ConsentCheck checked={form.notRobot} onChange={(v) => set("notRobot", v)} label="I'm not a robot." />

                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5" /> Your data is encrypted and handled per the DPDP Act.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="btn-ghost px-5 py-2.5 text-sm disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 3 ? (
            <button onClick={next} className="btn-primary px-6 py-2.5 text-sm">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Submit application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function ConsentCheck({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all",
        checked ? "border-cyan-400/50 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-300",
      )}
    >
      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors", checked ? "border-cyan-400 bg-cyan-400 text-ink-950" : "border-white/20")}>
        {checked && <CheckCircle2 className="h-4 w-4" />}
      </span>
      {label}
    </button>
  );
}
