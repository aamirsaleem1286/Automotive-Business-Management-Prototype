"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CarModel } from "./CarModel";
import { cn } from "@/lib/utils";

export default function CarScene({ className }: { className?: string }) {
  return (
    <div className={cn("h-full w-full", className)} aria-hidden="true">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [6.6, 3.1, 6.6], fov: 36, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.5 }}
      >
        <fog attach="fog" args={["#0b0d10", 11, 26]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={2.6}
          color="#fff4ea"
        />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.9}
          color="#66a9ff"
        />
        <pointLight
          position={[-4, 1.6, 3]}
          intensity={22}
          distance={10}
          color="#f04438"
        />
        <pointLight
          position={[3.5, 2.4, -4]}
          intensity={14}
          distance={12}
          color="#66a9ff"
        />
        <Suspense fallback={null}>
          <CarModel />
        </Suspense>
        <gridHelper
          args={[26, 26, "#34404d", "#1b222b"]}
          position={[0, -0.06, 0]}
        />
      </Canvas>
    </div>
  );
}
