"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createBodyShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-2.55, 0.18);
  shape.lineTo(-2.78, 0.62);
  shape.lineTo(-2.5, 0.94);
  shape.lineTo(-1.72, 1.08);
  shape.lineTo(-1.02, 1.5);
  shape.lineTo(0.12, 1.68);
  shape.lineTo(1.06, 1.52);
  shape.lineTo(1.82, 1.16);
  shape.lineTo(2.48, 0.96);
  shape.lineTo(2.78, 0.62);
  shape.lineTo(2.58, 0.2);
  shape.lineTo(1.72, 0.08);
  shape.lineTo(-1.72, 0.08);
  shape.closePath();
  return shape;
}

function createCabinShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.28, 1.06);
  shape.lineTo(-0.82, 1.44);
  shape.lineTo(0.08, 1.6);
  shape.lineTo(0.92, 1.46);
  shape.lineTo(1.48, 1.08);
  shape.lineTo(0.9, 1.02);
  shape.lineTo(-0.9, 1.02);
  shape.closePath();
  return shape;
}

const wheelPositions: Array<[number, number]> = [
  [-1.68, 1.16],
  [-1.68, -1.16],
  [1.7, 1.16],
  [1.7, -1.16],
];

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.34, 28]} />
        <meshStandardMaterial color="#12161c" metalness={0.35} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.176, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 24]} />
        <meshStandardMaterial
          color="#c9d1da"
          metalness={0.95}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, 0.187, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
        <meshStandardMaterial
          color="#f04438"
          metalness={0.4}
          roughness={0.3}
          emissive="#f04438"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  );
}

export function CarModel() {
  const group = useRef<THREE.Group>(null);
  const bodyShape = useMemo(createBodyShape, []);
  const cabinShape = useMemo(createCabinShape, []);
  const extrude = useMemo(
    () => ({
      depth: 2.5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.07,
      curveSegments: 12,
    }),
    []
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    const target =
      0.58 + state.pointer.x * 0.5 + Math.sin(time * 0.22) * 0.18;
    group.current.rotation.y +=
      (target - group.current.rotation.y) * Math.min(1, delta * 1.9);
    group.current.position.y = 0.02 + Math.sin(time * 0.9) * 0.035;
  });

  return (
    <group ref={group} position={[0, 0.02, 0]} rotation={[0, 0.58, 0]}>
      <group position={[0, 0, -1.25]}>
        <mesh castShadow receiveShadow>
          <extrudeGeometry args={[bodyShape, extrude]} />
          <meshStandardMaterial
            color="#d93a2f"
            metalness={0.72}
            roughness={0.26}
            envMapIntensity={1.1}
          />
        </mesh>
        <mesh scale={[1, 1, 1.02]}>
          <extrudeGeometry
            args={[
              cabinShape,
              {
                ...extrude,
                depth: 2.54,
                bevelSize: 0.02,
                bevelThickness: 0.02,
              },
            ]}
          />
          <meshStandardMaterial
            color="#0b1118"
            metalness={0.9}
            roughness={0.12}
            envMapIntensity={0.8}
          />
        </mesh>
      </group>

      {wheelPositions.map(([x, z]) => (
        <Wheel key={`${x}-${z}`} position={[x, 0.45, z]} />
      ))}

      <mesh position={[2.55, 0.7, 0.82]}>
        <boxGeometry args={[0.12, 0.15, 0.42]} />
        <meshStandardMaterial
          color="#fff6e8"
          emissive="#fff1d6"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[2.55, 0.7, -0.82]}>
        <boxGeometry args={[0.12, 0.15, 0.42]} />
        <meshStandardMaterial
          color="#fff6e8"
          emissive="#fff1d6"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-2.62, 0.78, 0]}>
        <boxGeometry args={[0.1, 0.08, 1.55]} />
        <meshStandardMaterial
          color="#ff5a4f"
          emissive="#f04438"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.82, 1.27]}>
        <boxGeometry args={[3.15, 0.035, 0.02]} />
        <meshStandardMaterial
          color="#ff8a80"
          emissive="#f04438"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.82, -1.27]}>
        <boxGeometry args={[3.15, 0.035, 0.02]} />
        <meshStandardMaterial
          color="#ff8a80"
          emissive="#f04438"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.8, 48]} />
        <meshStandardMaterial
          color="#080b0e"
          metalness={0.85}
          roughness={0.28}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}
