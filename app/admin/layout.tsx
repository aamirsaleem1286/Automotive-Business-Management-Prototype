import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/guard";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Command centre",
    template: "%s · AutoForge",
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?from=/admin");
  }

  return (
    <SessionProvider session={session}>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
