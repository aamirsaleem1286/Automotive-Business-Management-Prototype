"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiMutate } from "@/lib/api-client";

export function useLogout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);
    try {
      await apiMutate<{ ok: boolean }>("/api/auth/logout", "POST");
    } catch {
      // The cookie may already be gone; continue to the login screen.
    }
    router.replace("/login");
    router.refresh();
  }

  return { logout, pending };
}
