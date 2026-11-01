"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { MotionConfig } from "framer-motion";
import { fetcher } from "@/lib/api-client";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        keepPreviousData: true,
      }}
    >
      <MotionConfig reducedMotion="user">
        <ToastProvider>{children}</ToastProvider>
      </MotionConfig>
    </SWRConfig>
  );
}
