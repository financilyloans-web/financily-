import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/effects/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="chip mb-4">{eyebrow}</span>
      )}
      <h2 className="text-balance text-3xl font-bold leading-[1.12] text-white sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-slate-300/80 sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
