"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/*
 * One motion grammar for the sheet: things are drawn on, not dropped in.
 * Rules draw left to right, blocks resolve from a slight blur, lists stagger only when they are lists.
 * Everything runs once on first view; reduced motion keeps opacity only.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: reduce ? 0.3 : 0.7, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** A rule that draws itself when it scrolls into view. */
export function DrawnRule({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`h-px w-full origin-left bg-ink ${className}`}
      initial={{ scaleX: reduce ? 1 : 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE }}
    />
  );
}

export const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
