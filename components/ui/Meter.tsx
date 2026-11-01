import { cn } from "@/lib/utils";

export function Meter({
  value,
  tone = "accent",
  className,
}: {
  value: number;
  tone?: "accent" | "success" | "amber" | "blue" | "muted";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const colors = {
    accent: "bg-accent",
    success: "bg-success",
    amber: "bg-amber",
    blue: "bg-info",
    muted: "bg-[#728092]",
  } as const;

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#262d36]", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", colors[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
