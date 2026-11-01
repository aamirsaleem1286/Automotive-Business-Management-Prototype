import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-start justify-between gap-3",
        className
      )}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
