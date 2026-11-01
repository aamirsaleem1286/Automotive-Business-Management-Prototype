import { classForTone, cn, statusTone } from "@/lib/utils";

export function Badge({
  label,
  tone,
  className,
}: {
  label: string;
  tone?: ReturnType<typeof statusTone>;
  className?: string;
}) {
  const resolved = tone ?? statusTone(label);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold leading-none",
        classForTone(resolved),
        className
      )}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {label}
    </span>
  );
}
