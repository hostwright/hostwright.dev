import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  Text,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { smoothstep } from "./finaleShared";

// Concept D (act 4, after the shelf): a real `plan` -> `apply` transcript
// runs in a terminal on the left, reusing the site's own canonical example
// stack (service/redis + service/api, from data/homepage.ts's manifestExample)
// — not invented content. The moment "starting <service> ... healthy" finishes
// typing, that service's layer physically stacks in on the right: redis first
// (the dependency), api on top of it (built on it) — a literal infra stack.

const LOOP = 10;

type LineKind = "cmd" | "muted" | "add" | "ok" | "blank";

const LINE: { text: string; kind: LineKind; start: number; dur: number }[] = [
  { text: "$ hostwright plan", kind: "cmd", start: 0.0, dur: 0.05 },
  { text: "∙ reading hostwright.yaml", kind: "muted", start: 0.06, dur: 0.05 },
  { text: "∙ validating manifest … ok", kind: "muted", start: 0.12, dur: 0.05 },
  {
    text: "  + create   service/redis   redis:7",
    kind: "add",
    start: 0.18,
    dur: 0.06,
  },
  {
    text: "  + create   service/api     ghcr.io/example/api:latest",
    kind: "add",
    start: 0.25,
    dur: 0.07,
  },
  {
    text: "  plan: 2 to create, 0 to change, 0 to destroy",
    kind: "muted",
    start: 0.33,
    dur: 0.06,
  },
  { text: "", kind: "blank", start: 0.4, dur: 0 },
  { text: "$ hostwright apply", kind: "cmd", start: 0.44, dur: 0.05 },
  { text: "∙ starting redis … healthy", kind: "muted", start: 0.51, dur: 0.05 },
  { text: "∙ starting api … healthy", kind: "muted", start: 0.58, dur: 0.05 },
  {
    text: "✓ applied — 2 running, 0 pending",
    kind: "ok",
    start: 0.66,
    dur: 0.06,
  },
];

// index into LINE whose completion triggers each layer stacking in.
const LAYERS = [
  { label: "redis", lineIndex: 8 },
  { label: "api", lineIndex: 9 },
];

const KIND_COLOR: Record<LineKind, string> = {
  cmd: "#1f3a5f",
  muted: "#9a978d",
  add: "#3f7a5c",
  ok: "#3f7a5c",
  blank: "transparent",
};

function ClockBridge({ onTick }: { onTick: (t: number) => void }) {
  useFrame((state) => {
    onTick((state.clock.elapsedTime % LOOP) / LOOP);
  });
  return null;
}

const STACK_X = 3.2;
const LAYER_H = 0.72;
const LAYER_GAP = 0.16;
const BASE_Y = -1.0;

function Layer({
  index,
  label,
  groupRef,
}: {
  index: number;
  label: string;
  groupRef: (el: Group | null) => void;
}) {
  const y = BASE_Y + index * (LAYER_H + LAYER_GAP);
  return (
    <group ref={groupRef} position={[STACK_X, y, 0]} scale={0.001}>
      <RoundedBox args={[2.6, LAYER_H, 1.7]} radius={0.12} smoothness={5}>
        <meshPhysicalMaterial
          color="#7c80a4"
          roughness={0.38}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          envMapIntensity={1.1}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.87]}
        fontSize={0.26}
        color="#f4f1ea"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function Scene({
  layerRefs,
}: {
  layerRefs: React.MutableRefObject<(Group | null)[]>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0.6, 0.6, 11);
    camera.lookAt(1.6, -0.2, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 7]} intensity={0.6} />
      {LAYERS.map((l, i) => (
        <Layer
          key={l.label}
          index={i}
          label={l.label}
          groupRef={(el) => (layerRefs.current[i] = el)}
        />
      ))}
      <ContactShadows
        position={[STACK_X, BASE_Y - 0.42, 0]}
        opacity={0.32}
        scale={7}
        blur={2.6}
        far={5}
        resolution={512}
        color="#2a2620"
      />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[2, 5, 4]}
          scale={[10, 6, 1]}
          color="#ffffff"
        />
      </Environment>
    </>
  );
}

export default function FinaleTerminalBuild() {
  const layerRefs = useRef<(Group | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleTick = (t: number) => {
    LINE.forEach((line, i) => {
      const progress = smoothstep(
        line.start,
        line.start + Math.max(line.dur, 0.001),
        t,
      );
      const chars = Math.floor(progress * line.text.length);
      const el = lineRefs.current[i];
      if (el) el.textContent = line.text.slice(0, chars);
    });

    LAYERS.forEach((l, i) => {
      const src = LINE[l.lineIndex];
      const doneAt = src.start + src.dur;
      const pop = smoothstep(doneAt, doneAt + 0.06, t);
      const grp = layerRefs.current[i];
      if (grp) grp.scale.setScalar(Math.max(0.001, pop));
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0.6, 0.6, 11], fov: 34 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "#f4f1ea" }}
      >
        <Scene layerRefs={layerRefs} />
        <ClockBridge onTick={handleTick} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          left: "32px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "27rem",
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
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "11px",
              color: "#8a8577",
            }}
          >
            hostwright apply
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: "16px 18px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "13px",
            lineHeight: 1.85,
            whiteSpace: "pre-wrap",
            minHeight: "13rem",
          }}
        >
          {LINE.map((line, i) => (
            <div
              key={i}
              style={{ minHeight: "1.4em", color: KIND_COLOR[line.kind] }}
            >
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
