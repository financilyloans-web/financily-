import { SectionHeading } from "@/components/ui/SectionHeading";

const partners = [
  "Axis Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Kotak Mahindra Bank",
  "Bajaj Finserv",
  "Tata Capital",
  "IndusInd Bank",
  "Aditya Birla Capital",
  "Yes Bank",
  "Muthoot Finance",
  "IIFL Finance",
  "Standard Chartered",
];

export function PartnersMarquee() {
  const doubled = [...partners, ...partners];
  return (
    <section className="py-14">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Trusted Partners"
          title="Backed by India's leading lenders"
          description="We partner only with RBI-regulated banks, NBFCs, and authorized lending partners."
        />
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />

        <div className="overflow-hidden py-2">
          <div className="animate-marquee flex w-max items-center gap-4">
            {doubled.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="glass flex h-16 items-center rounded-2xl px-7 font-display text-lg font-bold tracking-tight text-slate-200 transition-colors hover:text-white"
              >
                <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-primary-500" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
