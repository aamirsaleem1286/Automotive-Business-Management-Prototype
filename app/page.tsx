import { redirect } from "next/navigation";
import { getSession } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  redirect(session ? "/admin" : "/login");
}
