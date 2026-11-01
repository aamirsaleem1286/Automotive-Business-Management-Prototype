"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NumberFormat = "currency" | "number" | "percent" | "text";

function formatValue(value: number, format: NumberFormat) {
  if (format === "currency") {
    return `RM ${new Intl.NumberFormat("en-MY", {
      maximumFractionDigits: 0,
    }).format(Math.round(value))}`;
  }
  if (format === "percent") {
    return `${Math.round(value)}%`;
  }
  return new Intl.NumberFormat("en-MY", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function AnimatedNumber({
  value,
  format,
}: {
  value: number;
  format: Exclude<NumberFormat, "text">;
}) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const previous = useRef(value);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      previous.current = value;
      return;
    }

    const from = previous.current;
    const to = value;
    const start = performance.now();
    const duration = 750;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previous.current = to;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduceMotion]);

  return <>{formatValue(display, format)}</>;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  format = "number",
  tone = "default",
  className,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: LucideIcon;
  format?: NumberFormat;
  tone?: "default" | "red";
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "group relative overflow-hidden rounded-[13px] border border-line/90 bg-panel p-4 shadow-panel sm:p-[18px]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/10" />
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-medium text-muted sm:text-xs">
          {label}
        </span>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
            tone === "red"
              ? "border-accent/20 bg-accent/10 text-accent"
              : "border-line bg-[#282d35] text-[#bdc7d3]"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none tracking-[-0.04em] text-ink sm:mt-3.5 sm:text-[29px]">
        {typeof value === "number" && format !== "text" ? (
          <AnimatedNumber value={value} format={format} />
        ) : (
          value
        )}
      </div>
      <div className="mt-1.5 text-[10px] leading-relaxed text-success sm:text-[11px]">
        {hint}
      </div>
    </motion.div>
  );
}
