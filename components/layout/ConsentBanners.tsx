"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import Link from "next/link";

const KEYS = {
  cookie: "financily_cookie_consent",
  privacy: "financily_privacy_consent",
};

export function ConsentBanners() {
  const [cookie, setCookie] = useState<boolean | null>(null);
  const [privacy, setPrivacy] = useState<boolean | null>(null);

  useEffect(() => {
    setCookie(localStorage.getItem(KEYS.cookie) === "accepted");
    setPrivacy(localStorage.getItem(KEYS.privacy) === "accepted");
  }, []);

  const acceptCookie = (value: string) => {
    localStorage.setItem(KEYS.cookie, value);
    setCookie(true);
  };

  const acceptPrivacy = () => {
    localStorage.setItem(KEYS.privacy, "accepted");
    setPrivacy(true);
  };

  return (
    <>
      <AnimatePresence>
        {cookie === false && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[70] sm:left-6 sm:right-auto sm:max-w-md"
          >
            <div className="surface-solid rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300">
                  <Cookie className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">We use cookies</p>
                  <p className="mt-1 text-sm text-slate-300/80">
                    We use essential and analytics cookies to improve your
                    experience. See our{" "}
                    <Link href="/cookie-policy" className="text-cyan-300 underline-offset-2 hover:underline">
                      Cookie Policy
                    </Link>{" "}
                    for details.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => acceptCookie("accepted")} className="btn-primary px-4 py-2 text-sm">
                  Accept all
                </button>
                <button onClick={() => acceptCookie("essential")} className="btn-ghost px-4 py-2 text-sm">
                  Essential only
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {privacy === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 z-[70] sm:left-auto sm:right-6 sm:max-w-lg"
          >
            <div className="surface-solid rounded-3xl p-5 ring-1 ring-primary-400/30">
              <p className="font-semibold text-white">Your privacy matters</p>
              <p className="mt-1 text-sm text-slate-300/80">
                We collect and process your data only with your consent, in line
                with the DPDP Act (India) and GDPR-ready practices.{" "}
                <Link href="/privacy-policy" className="text-cyan-300 underline-offset-2 hover:underline">
                  Read the Privacy Policy
                </Link>
                .
              </p>
              <div className="mt-4">
                <button onClick={acceptPrivacy} className="btn-primary px-4 py-2 text-sm">
                  I understand
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
