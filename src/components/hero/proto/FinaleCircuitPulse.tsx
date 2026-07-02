import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import { AdditiveBlending, MeshBasicMaterial } from "three";
import ContainerModel from "../ContainerModel";
import HBridge from "../HBridge";
import {
  FEATURE_REST_SCALE,
  STATIONS,
  slotPosition,
  smoothstep,
} from "./finaleShared";

// Concept A: a pulse of light travels container-to-container in step order,
// each one lighting up as it's reached. Once both shelves are lit, one big
// line spelling the full sequence fades in and the bridge flashes gold-blue.

const LOOP = 8;

function Aura({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  const pos = slotPosition(index);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % LOOP) / LOOP;
    const litAt = index * 0.08;
    const lit = smoothstep(litAt, litAt + 0.05, t);
    const flash = smoothstep(0.76, 0.82, t) - smoothstep(0.92, 1.0, t);
    const mat = ref.current?.material as MeshBasicMaterial | undefined;
    if (mat) mat.opacity = Math.max(lit * 0.3, flash * 0.65);
  });

  return (
    <mesh ref={ref} position={[pos[0], pos[1], pos[2] + 0.5]}>
      <planeGeometry args={[2.0, 2.0]} />
      <meshBasicMaterial
        color="#f0a83c"
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}

function CaptionLine() {
  const ref = useRef<HTMLDivElement>(null);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % LOOP) / LOOP;
    const op = smoothstep(0.66, 0.76, t) - smoothstep(0.94, 1.0, t);
    if (ref.current) ref.current.style.opacity = String(Math.max(0, op));
  });

  return (
    <Html center position={[0, 3.6, 0]} style={{ pointerEvents: "none" }}>
      <div
        ref={ref}
        style={{
          opacity: 0,
          fontFamily: "system-ui, sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          whiteSpace: "nowrap",
          color: "#20232a",
          background: "#f7f5ef",
          padding: "14px 26px",
          borderRadius: "999px",
          boxShadow: "0 16px 40px -18px rgba(32,35,39,0.5)",
        }}
      >
        {STATIONS.map((s) => s.label).join("  →  ")}
      </div>
    </Html>
  );
}

function Scene() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.0, 15);
    camera.lookAt(0, 0.4, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 7]} intensity={0.6} />
      <HBridge />
      {STATIONS.map((_, i) => (
        <group key={i} position={slotPosition(i)} scale={FEATURE_REST_SCALE}>
          <ContainerModel />
        </group>
      ))}
      {STATIONS.map((_, i) => (
        <Aura key={i} index={i} />
      ))}
      <CaptionLine />
      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.3}
        scale={16}
        blur={3}
        far={6}
        resolution={512}
        color="#2a2620"
      />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[0, 5, 4]}
          scale={[12, 6, 1]}
          color="#ffffff"
        />
      </Environment>
    </>
  );
}

export default function FinaleCircuitPulse() {
  return (
    <Canvas
      camera={{ position: [0, 1.0, 15], fov: 34 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "#f4f1ea" }}
    >
      <Scene />
    </Canvas>
  );
}
