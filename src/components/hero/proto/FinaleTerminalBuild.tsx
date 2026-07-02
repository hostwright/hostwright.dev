import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  type Group,
  type Mesh,
  MeshBasicMaterial,
} from "three";
import ContainerModel from "../ContainerModel";
import HBridge from "../HBridge";
import { FEATURE_REST_SCALE, STATIONS, slotPosition, smoothstep } from "./finaleShared";

// Concept D: a terminal types a real `hostwright plan` run, and the moment
// each line finishes typing, that step's container builds onto the shelf —
// the "something is running and I can see it happen" confidence pattern,
// tied directly to the product's own CLI output rather than an abstract effect.

const LOOP = 9;

const LINES = [
  "$ hostwright plan",
  ...STATIONS.map((s) => `∙ ${s.label.padEnd(14)} ${s.note}`),
  "✓ reconciled — one loop, six steps",
];

const LINE_START = LINES.map((_, i) =>
  i === 0 ? 0 : i <= STATIONS.length ? 0.08 + (i - 1) * 0.11 : 0.78,
);
const LINE_DUR = LINES.map((_, i) => (i === 0 ? 0.05 : i <= STATIONS.length ? 0.08 : 0.08));

function ClockBridge({ onTick }: { onTick: (t: number) => void }) {
  useFrame((state) => {
    onTick((state.clock.elapsedTime % LOOP) / LOOP);
  });
  return null;
}

function Scene({
  containerRefs,
  auraRefs,
}: {
  containerRefs: React.MutableRefObject<(Group | null)[]>;
  auraRefs: React.MutableRefObject<(Mesh | null)[]>;
}) {
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
      {STATIONS.map((_, i) => {
        const pos = slotPosition(i);
        return (
          <group
            key={i}
            ref={(el) => (containerRefs.current[i] = el)}
            position={pos}
            scale={0.001}
          >
            <ContainerModel />
          </group>
        );
      })}
      {STATIONS.map((_, i) => {
        const pos = slotPosition(i);
        return (
          <mesh
            key={i}
            ref={(el) => (auraRefs.current[i] = el)}
            position={[pos[0], pos[1], pos[2] + 0.5]}
          >
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
      })}
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

export default function FinaleTerminalBuild() {
  const containerRefs = useRef<(Group | null)[]>([]);
  const auraRefs = useRef<(Mesh | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleTick = (t: number) => {
    LINES.forEach((line, i) => {
      const progress = smoothstep(LINE_START[i], LINE_START[i] + LINE_DUR[i], t);
      const chars = Math.floor(progress * line.length);
      const el = lineRefs.current[i];
      if (el) el.textContent = line.slice(0, chars);

      if (i >= 1 && i <= STATIONS.length) {
        const idx = i - 1;
        const doneAt = LINE_START[i] + LINE_DUR[i];
        const pop = smoothstep(doneAt, doneAt + 0.05, t);
        const grp = containerRefs.current[idx];
        if (grp) grp.scale.setScalar(Math.max(0.001, pop * FEATURE_REST_SCALE));

        const flash =
          smoothstep(doneAt, doneAt + 0.04, t) - smoothstep(doneAt + 0.25, doneAt + 0.55, t);
        const aura = auraRefs.current[idx];
        const mat = aura?.material as MeshBasicMaterial | undefined;
        if (mat) mat.opacity = Math.max(0, flash) * 0.7;
      }
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 1.0, 15], fov: 34 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "#f4f1ea" }}
      >
        <Scene containerRefs={containerRefs} auraRefs={auraRefs} />
        <ClockBridge onTick={handleTick} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          left: "32px",
          bottom: "32px",
          width: "26rem",
          maxWidth: "calc(100% - 64px)",
          border: "1px solid #ddd8cc",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#fcfbf8",
          boxShadow: "0 18px 40px -28px rgba(32,35,39,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            background: "#f0ede3",
            borderBottom: "1px solid #ddd8cc",
          }}
        >
          <span style={{ display: "inline-flex", gap: "6px" }}>
            <i style={dotStyle} />
            <i style={dotStyle} />
            <i style={dotStyle} />
          </span>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "#8a8577" }}>
            hostwright plan
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: "16px 18px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "13px",
            lineHeight: 1.85,
            color: "#20232a",
            whiteSpace: "pre-wrap",
            minHeight: "9.5rem",
          }}
        >
          {LINES.map((_, i) => (
            <div key={i} style={{ minHeight: "1.4em" }}>
              <span ref={(el) => (lineRefs.current[i] = el)} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

const dotStyle: React.CSSProperties = {
  width: "9px",
  height: "9px",
  borderRadius: "999px",
  background: "#ccc6b6",
  display: "inline-block",
};
