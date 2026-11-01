"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg {
  from: "bot" | "user";
  text: string;
}

const GREETING =
  "Hi! 👋 I'm Fin, Financily's assistant. I can help you understand personal loans, eligibility, interest rates, and how to apply. What would you like to know?";

function getReply(input: string): string {
  const q = input.toLowerCase();

  if (/(hi|hello|hey|namaste)/.test(q)) {
    return "Hello! Great to see you. Ask me anything about personal loans — eligibility, rates, documents, or the application process.";
  }
  if (/eligib/.test(q)) {
    return "Eligibility typically depends on age (21–60), monthly income (salaried ₹20,000+ / self-employed), credit score (preferably 700+), and employment stability. Try our Eligibility Checker for a personalized estimate!";
  }
  if (/interest|rate|emi/.test(q)) {
    return "Interest rates vary by lender and profile — currently around 8.5%–24% p.a. Use our EMI Calculator to see monthly instalments for any amount, rate, and tenure.";
  }
  if (/(document|paper|required|need)/.test(q)) {
    return "You'll usually need: PAN card, Aadhaar, bank statements (last 3–6 months), salary slips / ITR, and proof of work. Our process is 100% paperless — upload everything online.";
  }
  if (/(fast|time|how long|disbursal|disburse)/.test(q)) {
    return "Many approved loans can be disbursed within 24–72 hours after lender verification. Pre-approval is often instant once your details match a lender's criteria.";
  }
  if (/(safe|secure|privacy|data|trust)/.test(q)) {
    return "Financily is a loan marketplace, not a lender. Your data is encrypted, handled per the DPDP Act, and shared only with lending partners you consent to. We never sell your information.";
  }
  if (/(apply|how do i|start|form)/.test(q)) {
    return "Great! Hit the Apply Now button, fill the short multi-step form, and we'll match you with approved lenders. It takes under 3 minutes.";
  }
  if (/(bank|nbfc|lender|partner)/.test(q)) {
    return "We work with approved banks, NBFCs, and lending partners. Visit our Partner Lenders page to see the networks we connect you with.";
  }
  if (/(score|credit)/.test(q)) {
    return "Your credit score is a key factor — 700+ generally unlocks the best offers. You can check your score for free with many of our partner lenders.";
  }
  return "Good question! For details specific to your situation, try our Eligibility Checker or reach out via the contact page. You can also start an application — it only takes a few minutes.";
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: getReply(text) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="surface-solid fixed bottom-20 right-5 z-[70] flex h-[480px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl sm:right-6"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-ink-900/80 px-4 py-3.5 backdrop-blur-2xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-primary-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-white">Fin · AI Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · replies instantly
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.from === "bot"
                      ? "rounded-bl-sm bg-white/8 text-slate-100"
                      : "ml-auto rounded-br-sm bg-gradient-to-br from-primary-500 to-accent-600 text-white",
                  )}
                >
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/8 px-4 py-3 w-fit">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about loans…"
                className="input-glass flex-1 rounded-full px-4 py-2.5 text-sm"
              />
              <button
                onClick={send}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-primary-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-20 left-5 z-[65] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-[0_12px_36px_-8px_rgba(124,58,237,0.7)]"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-950 bg-cyan-300" />
        )}
      </motion.button>
    </>
  );
}
