import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[10px] border border-[#ff7a70]/40 bg-gradient-to-br from-[#ff5c50] to-[#b6251b] shadow-[0_6px_20px_-8px_rgba(240,68,56,0.9)]",
        className
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/35" />
      <svg viewBox="0 0 32 32" className="h-[21px] w-[21px]" fill="none">
        <path
          d="M5.5 25.5 14.2 6.2h3.7l8.6 19.3h-5.3l-1.55-3.8h-7.5L11 25.5H5.5Zm8.9-8.1h3.4l-1.7-4.6-1.7 4.6Z"
          fill="#fff"
        />
        <path
          d="M21.8 6.2h4.8l-3.2 7.2h-4.8l3.2-7.2Z"
          fill="#fff"
          fillOpacity="0.35"
        />
      </svg>
    </span>
  );
}

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandMark />
      {!compact ? (
        <div className="min-w-0 leading-none">
          <div className="truncate text-[15px] font-extrabold tracking-[-0.03em] text-ink">
            Auto<span className="text-accent">Forge</span>
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted">
            Automotive OS
          </div>
        </div>
      ) : null}
    </div>
  );
}
