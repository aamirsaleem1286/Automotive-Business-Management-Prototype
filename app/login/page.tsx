import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/guard";
import { LoginView } from "./LoginView";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const raw = Array.isArray(params.from) ? params.from[0] : params.from;
  const from =
    typeof raw === "string" && raw.startsWith("/admin") ? raw : "/admin";

  return <LoginView from={from} />;
}
