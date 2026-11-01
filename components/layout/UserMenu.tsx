"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, ShieldCheck } from "lucide-react";
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

export function UserMenu() {
  const session = useSession();
  const { logout, pending } = useLogout();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg border border-transparent pl-0.5 pr-1.5 transition-colors hover:border-line hover:bg-panel2/70"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-[11px] font-bold text-accent">
          {initials(session.name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[140px] truncate text-[11px] font-semibold text-ink">
            {session.name}
          </span>
          <span className="block text-[9px] uppercase tracking-[0.1em] text-muted">
            {session.role}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 text-muted transition-transform sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
        >
          <div className="border-b border-line px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-xs font-bold text-accent">
                {initials(session.name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-ink">
                  {session.name}
                </div>
                <div className="truncate text-[10px] text-muted">
                  {session.email}
                </div>
              </div>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-success">
              <ShieldCheck className="h-2.5 w-2.5" />
              {session.role} access
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/admin/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted transition-colors hover:bg-panel2 hover:text-ink"
            >
              <Settings className="h-3.5 w-3.5" />
              System setup
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={pending}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[#ff9d95] transition-colors hover:bg-[#2a1a19] disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
