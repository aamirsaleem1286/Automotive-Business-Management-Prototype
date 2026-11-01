"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, mobileNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line/80 bg-[#0d1014]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid h-[58px] grid-cols-5">
        {mobileNavItems.map((item) => {
          const active = isNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition-colors",
                active ? "text-accent" : "text-[#7f8b99]"
              )}
            >
              {active ? (
                <span className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-accent" />
              ) : null}
              <Icon className="h-[18px] w-[18px]" />
              <span className="leading-none">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
