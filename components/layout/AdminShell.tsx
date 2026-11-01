import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-col md:pl-[72px] min-[1051px]:pl-[238px]">
        <Topbar />
        <main className="flex-1 px-3.5 pb-24 pt-4 sm:px-6 sm:pt-5 md:pb-8 lg:px-7">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
