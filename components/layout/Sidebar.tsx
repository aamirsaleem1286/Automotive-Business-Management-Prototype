"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Brand, BrandMark } from "./Brand";
import { navGroups, isNavActive } from "@/lib/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { useLogout } from "./useLogout";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Sidebar() {
  const pathname = usePathname();
  const session = useSession();
  const { logout, pending } = useLogout();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[72px] flex-col border-r border-line/80 bg-[#0d1014]/95 backdrop-blur-xl md:flex min-[1051px]:w-[238px]">
      <div className="flex h-[62px] shrink-0 items-center border-b border-line/70 px-[17px] min-[1051px]:px-5">
        <div className="min-[1051px]:hidden">
          <BrandMark />
        </div>
        <div className="hidden min-[1051px]:block">
          <Brand />
        </div>
      </div>

      <nav
        aria-label="Admin navigation"
        className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-2.5 py-4 min-[1051px]:px-3"
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-2">
            <div className="mb-1.5 hidden px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#5f6b79] min-[1051px]:block">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-9 items-center gap-2.5 rounded-lg border border-transparent px-2.5 text-xs font-medium transition-colors",
                      "justify-center min-[1051px]:justify-start",
                      active
                        ? "border-accent/20 bg-accent/10 text-ink"
                        : "text-muted hover:bg-panel2/80 hover:text-ink"
                    )}
                  >
                    {active ? (
                      <span className="absolute -left-2.5 top-1/2 hidden h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent min-[1051px]:block" />
                    ) : null}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active
                          ? "text-accent"
                          : "text-[#7f8b99] group-hover:text-ink"
                      )}
                    />
                    <span className="hidden truncate min-[1051px]:block">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line/70 p-2.5 min-[1051px]:p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-line/70 bg-panel2/60 p-2 min-[1051px]:p-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-[11px] font-bold text-accent">
            {initials(session.name)}
          </div>
          <div className="hidden min-w-0 flex-1 min-[1051px]:block">
            <div className="truncate text-[11px] font-semibold text-ink">
              {session.name}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-muted">
              <ShieldCheck className="h-2.5 w-2.5" />
              {session.role}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={pending}
            aria-label="Sign out"
            title="Sign out"
            className="hidden h-7 w-7 shrink-0 place-items-center rounded-md text-[#7f8b99] transition-colors hover:bg-[#262d36] hover:text-ink disabled:opacity-50 min-[1051px]:grid"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          aria-label="Sign out"
          title="Sign out"
          className="mt-2 grid h-8 w-full place-items-center rounded-md text-[#7f8b99] transition-colors hover:bg-panel2 hover:text-ink disabled:opacity-50 min-[1051px]:hidden"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
