"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays } from "lucide-react";
import { Brand } from "./Brand";
import { UserMenu } from "./UserMenu";
import { isNavActive, navItems } from "@/lib/navigation";

export function Topbar() {
  const pathname = usePathname();
  const [today, setToday] = useState("");
  const current =
    navItems.find((item) => isNavActive(pathname, item))?.label ??
    "Command centre";

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date())
    );
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-[62px] shrink-0 items-center justify-between gap-3 border-b border-line/70 bg-bg/85 px-3.5 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <Brand />
        </div>
        <div className="hidden min-w-0 md:block">
          <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#5f6b79]">
            <span>AutoForge</span>
            <span className="text-[#3b4552]">/</span>
            <span className="text-muted">Command centre</span>
          </div>
          <h2 className="mt-0.5 truncate text-[13px] font-semibold tracking-[-0.01em] text-ink">
            {current}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <div className="hidden items-center gap-1.5 rounded-full border border-line/70 bg-panel2/50 px-2.5 py-1.5 lg:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          <span className="text-[10px] font-medium text-muted">
            Systems operational
          </span>
        </div>

        <div className="hidden items-center gap-1.5 border-l border-line/70 pl-3 text-[10px] text-muted sm:flex">
          <CalendarDays className="h-3.5 w-3.5 text-[#7f8b99]" />
          <span className="min-w-[112px]">{today || "\u00A0"}</span>
        </div>

        <Link
          href="/admin/updates"
          aria-label="Customer updates"
          title="Customer updates"
          className="relative grid h-8 w-8 place-items-center rounded-lg border border-transparent text-[#8b97a5] transition-colors hover:border-line hover:bg-panel2/70 hover:text-ink"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-bg bg-accent" />
        </Link>

        <div className="ml-0.5 border-l border-line/70 pl-1.5 sm:pl-2.5">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
