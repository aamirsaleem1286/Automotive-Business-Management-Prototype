import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "default" | "ghost" | "danger" | "soft";
export type ButtonSize = "sm" | "md" | "icon";
type Variant = ButtonVariant;
type Size = ButtonSize;

const variants: Record<Variant, string> = {
  primary:
    "border-accent bg-accent text-white shadow-[0_8px_24px_-12px_rgba(240,68,56,0.9)] hover:bg-[#ff5146]",
  default:
    "border-line bg-[#20262f] text-ink hover:border-[#3d4855] hover:bg-[#252c36]",
  ghost:
    "border-transparent bg-transparent text-muted hover:border-line/60 hover:bg-[#1a2028] hover:text-ink",
  danger:
    "border-[#5c2b29] bg-[#351c1b] text-[#ffb3ad] hover:border-[#7c3733] hover:bg-[#422321]",
  soft:
    "border-line/70 bg-[#181e25] text-ink/90 hover:border-[#3d4855] hover:bg-[#1e252e]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 rounded-lg px-2.5 text-[11px]",
  md: "h-10 rounded-lg px-3.5 text-xs",
  icon: "h-8 w-8 rounded-lg text-xs",
};

export function buttonClasses({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 border font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  className,
  variant = "default",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}
