import { cn } from "@/lib/utils";

export function CarFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="absolute h-56 w-56 rounded-full bg-accent/20 blur-[80px]" />
      <svg
        viewBox="0 0 640 320"
        className="relative w-[92%] max-w-[620px]"
        fill="none"
      >
        <defs>
          <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6a5e" />
            <stop offset="55%" stopColor="#d93a2f" />
            <stop offset="100%" stopColor="#7c1d16" />
          </linearGradient>
          <linearGradient id="car-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fd0ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0b1118" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="car-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="322" cy="262" rx="252" ry="34" fill="url(#car-shadow)" />
        <path
          d="M92 208c2-22 14-33 37-37l40-6c22-3 37-12 55-30 21-21 43-30 77-30h58c31 0 54 10 75 33l35 38c8 9 18 13 31 15 22 3 33 12 35 33l1 20H88l4-36Z"
          fill="url(#car-body)"
          stroke="#ff9a92"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <path
          d="M244 134c18-18 36-25 61-25h53c25 0 44 8 61 27l24 28H213l31-30Z"
          fill="url(#car-glass)"
          stroke="#9fd0ff"
          strokeOpacity="0.25"
        />
        <path
          d="M350 110v54M240 137h226"
          stroke="#0b1118"
          strokeOpacity="0.6"
          strokeWidth="5"
        />
        <path
          d="M96 210h444"
          stroke="#ff8a80"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <rect x="512" y="176" width="24" height="11" rx="4" fill="#fff1d6" />
        <rect x="512" y="176" width="24" height="11" rx="4" fill="#fff" opacity="0.3" />
        <rect x="92" y="184" width="20" height="8" rx="3" fill="#ff5a4f" />
        {[190, 462].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={232} r="54" fill="#0d1116" stroke="#2b333d" strokeWidth="3" />
            <circle cx={cx} cy={232} r="31" fill="#161c24" stroke="#7f8b99" strokeWidth="2" />
            <circle cx={cx} cy={232} r="9" fill="#f04438" />
            <path
              d={`M${cx - 16} 232h32M${cx} 216v32`}
              stroke="#4a5563"
              strokeWidth="3"
            />
          </g>
        ))}
        <path
          d="M150 258h330"
          stroke="#f04438"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeDasharray="10 14"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </div>
  );
}
