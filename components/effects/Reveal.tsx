"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "span";
}

export function Reveal({ children, className, delay = 0, once = true, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}
