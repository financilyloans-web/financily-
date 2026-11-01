# FINANCILY 💠

A world-class, futuristic **fintech loan marketplace** built with Next.js,
React, TypeScript, Tailwind CSS, Framer Motion and Firebase.

**Financily is a loan aggregation and lead-generation platform** — it is
**not** a lender, bank, or NBFC. It connects borrowers with approved
third-party lending partners (banks, NBFCs, fintech lenders).

---

## ✨ Highlights

- **Premium dark futuristic UI** — electric blue / purple / cyan gradients,
  glassmorphism, neomorphism, animated aurora background, particle canvas,
  mouse-tracking glow, grain overlay.
- **High-end animations** — Framer Motion reveals, animated counters,
  floating cards, marquee lender carousel, parallax-style hero, animated
  EMI chart, FAQ accordions, micro-interactions.
- **Interactive tools** — live EMI calculator with chart, and a real-time
  loan eligibility checker with an animated gauge.
- **Full multi-step lead form** with required consents and the mandatory
  platform disclaimer.
- **Free authentication** via Firebase (email sign-up/login, email
  verification, forgot/reset password, Google sign-in).
- **User dashboard** — profile, applications, eligibility status, saved
  requests, with Firestore persistence.
- **Compliance** — complete Privacy Policy (DPDP Act, 2023 + GDPR-ready),
  Terms, Disclaimer, Cookie Policy, consent banners, SSL notice, data
  handling safeguards.
- **Extra features** — WhatsApp float, AI chat assistant, newsletter
  subscription, lead tracking, modern analytics UI.
- **Mobile-first responsive**, SEO-optimized metadata, and sub-200 kB
  first-load JavaScript.

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12, GSAP (installed), canvas particles |
| Auth + DB | Firebase Authentication + Firestore |
| Icons | lucide-react |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm run start
```

---

## 🔐 Firebase setup (optional but recommended)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** → sign-in methods → **Email/Password** and **Google**.
3. Create **Cloud Firestore** database.
4. Copy `.env.example` to `.env.local` and fill in the values.

> Without the env vars the app still builds and runs — auth pages and the
> dashboard show a clear "not configured" notice, and the lead form stores
> submissions locally instead of Firestore.

---

## 🗺️ Routes

| Route | Page |
| --- | --- |
| `/` | Home (hero, partners, why us, process, calculator, benefits, testimonials, FAQ, CTA) |
| `/personal-loan` | Personal loan landing |
| `/eligibility-checker` | Interactive eligibility checker |
| `/emi-calculator` | EMI calculator |
| `/apply` | Multi-step lead form |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth |
| `/dashboard` | User dashboard (protected) |
| `/about`, `/contact`, `/blog`, `/partner-lenders` | Company pages |
| `/privacy-policy`, `/terms`, `/disclaimer`, `/cookie-policy` | Legal / compliance |

---

## 📄 License

© Financily. All rights reserved.
