import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends ComponentProps<"div"> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, hover, glow, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-3xl",
        hover && "card-hover",
        glow && "relative overflow-hidden",
        className,
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(61,220,255,0.55), transparent 70%)",
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
