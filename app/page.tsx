import { Hero } from "@/components/home/Hero";
import { PartnersMarquee } from "@/components/home/PartnersMarquee";
import { WhyChoose } from "@/components/home/WhyChoose";
import { LoanProcess } from "@/components/home/LoanProcess";
import { Benefits } from "@/components/home/Benefits";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { CtaBand } from "@/components/home/CtaBand";
import { EmiCalculator } from "@/components/calculator/EmiCalculator";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PartnersMarquee />
      <WhyChoose />
      <LoanProcess />

      <section className="section-shell py-20">
        <SectionHeading
          eyebrow="Loan Calculator"
          title="Calculate your EMI in seconds"
          description="Adjust the amount, rate, and tenure to see your monthly instalment and total interest."
        />
        <EmiCalculator />
        <div className="mt-6 text-center">
          <ButtonLink href="/emi-calculator" variant="ghost">
            Open full EMI calculator
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      <Benefits />
      <Testimonials />
      <Faq />
      <CtaBand />
    </>
  );
}
