import type { ReactNode } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function PageHero({ eyebrow, title, description, align = "center", className }: PageHeroProps) {
  return (
    <div className={cn("section-shell pb-4 pt-6", className)}>
      <Reveal className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
        {eyebrow && <span className="chip mb-4">{eyebrow}</span>}
        <h1 className="text-balance font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-pretty text-lg leading-relaxed text-slate-300/80">{description}</p>
        )}
      </Reveal>
    </div>
  );
}
