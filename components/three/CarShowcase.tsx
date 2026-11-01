"use client";

import {
  Component,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { CarFallback } from "./CarFallback";
import { cn } from "@/lib/utils";

const CarScene = dynamic(() => import("./CarScene"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

function SceneSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-40 w-64">
        <div className="absolute inset-0 animate-pulse rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-6 bottom-6 h-14 rounded-2xl border border-line bg-panel2/70" />
        <div className="absolute inset-x-14 bottom-2 h-6 rounded-full bg-[#0d1116]" />
      </div>
    </div>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D scene disabled:", error.message, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function CarShowcase({ className }: { className?: string }) {
  const [mode, setMode] = useState<"pending" | "scene" | "static">("pending");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    setMode(reduce || narrow || connection?.saveData ? "static" : "scene");
  }, []);

  return (
    <div className={cn("relative h-full w-full", className)}>
      {mode === "pending" ? <SceneSkeleton /> : null}
      {mode === "static" ? <CarFallback /> : null}
      {mode === "scene" ? (
        <SceneBoundary fallback={<CarFallback />}>
          <CarScene />
        </SceneBoundary>
      ) : null}
    </div>
  );
}
