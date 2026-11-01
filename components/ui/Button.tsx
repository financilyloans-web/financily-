import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "plain";
type Size = "md" | "lg" | "sm";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ComponentProps<"button">;
type LinkProps = BaseProps & ComponentProps<typeof Link>;

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-[0.95rem] px-6 py-3",
  lg: "text-base px-8 py-4",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        variant === "primary" && "btn-primary",
        variant === "ghost" && "btn-ghost",
        variant === "plain" && "inline-flex items-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200 transition-colors",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        variant === "primary" && "btn-primary",
        variant === "ghost" && "btn-ghost",
        variant === "plain" && "inline-flex items-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200 transition-colors",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
