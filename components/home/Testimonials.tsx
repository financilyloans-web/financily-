import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/effects/Reveal";

const reviews = [
  {
    name: "Rohit Sharma",
    role: "Software Engineer, Pune",
    text: "I compared 6 lenders in minutes and got disbursal in under a day. The process was completely online — couldn't be easier.",
    initials: "RS",
    tint: "from-cyan-400 to-primary-500",
  },
  {
    name: "Priya Nair",
    role: "Business Owner, Kochi",
    text: "As a self-employed applicant, I always struggle with documents. Financily's partners accepted my ITR and GST returns. Transparent rates too.",
    initials: "PN",
    tint: "from-primary-500 to-accent-500",
  },
  {
    name: "Aditya Verma",
    role: "Banker, Delhi",
    text: "Genuinely the most premium loan marketplace I've used. The dashboard tracking is fantastic and customer support was quick.",
    initials: "AV",
    tint: "from-accent-500 to-fuchsia-400",
  },
  {
    name: "Sneha Kulkarni",
    role: "Doctor, Mumbai",
    text: "The EMI calculator and eligibility checker are spot on. I knew exactly what to expect before applying. Highly recommended.",
    initials: "SK",
    tint: "from-emerald-400 to-cyan-500",
  },
  {
    name: "Arjun Mehta",
    role: "Consultant, Bengaluru",
    text: "Got offers from three NBFCs and picked the lowest rate. The whole flow felt secure and trustworthy.",
    initials: "AM",
    tint: "from-amber-400 to-orange-500",
  },
  {
    name: "Kavya Iyer",
    role: "HR Manager, Chennai",
    text: "Fresh to credit and still got approved thanks to partner lender options. Financily truly opens doors.",
    initials: "KI",
    tint: "from-cyan-400 to-emerald-400",
  },
];

export function Testimonials() {
  return (
    <section className="section-shell py-20">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by thousands of borrowers"
        description="Real stories from people who found the right loan through Financily."
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.06}>
            <figure className="glass card-hover relative h-full rounded-3xl p-6">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-white/10" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-slate-200">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${r.tint} font-display text-sm font-bold text-white`}>
                  {r.initials}
                </span>
                <div>
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
