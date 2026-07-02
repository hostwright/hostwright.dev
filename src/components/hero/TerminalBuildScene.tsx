import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  Text,
  useTexture,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { MathUtils, type Group } from "three";

// Act 4 of the hero film, after the fleet settles onto the shelf: a terminal
// runs `plan` then `apply` and a 5-service stack builds beside it. Driven by
// this section's own scroll progress — same self-contained pattern as
// HeroScene.tsx's Rig (read #terminal-build-film's bounding rect each frame)
// — not an auto-looping demo like the prototype this was ported from.

type LineKind = "cmd" | "muted" | "add" | "ok" | "blank";

// Compressed into t:[0, ~0.57] on purpose, leaving the back half of the
// section's scroll range for the pack-frame reveal + a real hold on it,
// rather than squeezing that payoff into a sliver at the very end.
const LINE: { text: string; kind: LineKind; start: number; dur: number }[] = [
  { text: "$ hostwright plan", kind: "cmd", start: 0.0, dur: 0.035 },
  {
    text: "∙ reading hostwright.yaml",
    kind: "muted",
    start: 0.042,
    dur: 0.014,
  },
  {
    text: "∙ validating manifest … ok",
    kind: "muted",
    start: 0.063,
    dur: 0.014,
  },
  {
    text: "  + create   service/postgres  postgres:16",
    kind: "add",
    start: 0.091,
    dur: 0.014,
  },
  {
    text: "  + create   service/redis     redis:7",
    kind: "add",
    start: 0.112,
    dur: 0.014,
  },
  {
    text: "  + create   service/api       ghcr.io/example/api",
    kind: "add",
    start: 0.133,
    dur: 0.014,
  },
  {
    text: "  + create   service/worker    ghcr.io/example/worker",
    kind: "add",
    start: 0.154,
    dur: 0.014,
  },
  {
    text: "  + create   service/nginx     nginx:1.27",
    kind: "add",
    start: 0.175,
    dur: 0.014,
  },
  {
    text: "  plan: 5 to create, 0 to change, 0 to destroy",
    kind: "muted",
    start: 0.203,
    dur: 0.014,
  },
  { text: "", kind: "blank", start: 0.238, dur: 0 },
  { text: "$ hostwright apply", kind: "cmd", start: 0.259, dur: 0.035 },
  {
    text: "∙ starting postgres … healthy",
    kind: "muted",
    start: 0.308,
    dur: 0.014,
  },
  {
    text: "∙ starting redis … healthy",
    kind: "muted",
    start: 0.357,
    dur: 0.014,
  },
  { text: "∙ starting api … healthy", kind: "muted", start: 0.406, dur: 0.014 },
  {
    text: "∙ starting worker … healthy",
    kind: "muted",
    start: 0.455,
    dur: 0.014,
  },
  {
    text: "∙ starting nginx … healthy",
    kind: "muted",
    start: 0.504,
    dur: 0.014,
  },
  {
    text: "✓ applied — 5 running, 0 pending",
    kind: "ok",
    start: 0.553,
    dur: 0.021,
  },
];

// index into LINE whose completion triggers each layer stacking in, bottom
// to top: data layer first, gateway last — a real dependency order.
const LAYERS = [
  { label: "postgres", lineIndex: 11 },
  { label: "redis", lineIndex: 12 },
  { label: "api", lineIndex: 13 },
  { label: "worker", lineIndex: 14 },
  { label: "nginx", lineIndex: 15 },
];

const KIND_COLOR: Record<LineKind, string> = {
  cmd: "#1f3a5f",
  muted: "#9a978d",
  add: "#3f7a5c",
  ok: "#3f7a5c",
  blank: "transparent",
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const STACK_X = 3.2;
const LAYER_W = 2.6;
const LAYER_H = 0.6;
const LAYER_D = 1.7;
const LAYER_GAP = 0.14;
const STEP = LAYER_H + LAYER_GAP;
const BASE_Y = -1.4;
const STACK_CENTER_Y = BASE_Y + ((LAYERS.length - 1) * STEP) / 2;

// The pack frame: a translucent shell that scales in around the whole stack
// once the last service is healthy — Hostwright as the thing holding it all.
const STACK_BOTTOM = BASE_Y - LAYER_H / 2;
const STACK_TOP = BASE_Y + (LAYERS.length - 1) * STEP + LAYER_H / 2;
const FRAME_W = LAYER_W + 0.34;
const FRAME_H = STACK_TOP - STACK_BOTTOM + 0.34;
const FRAME_D = LAYER_D + 0.34;

function Layer({
  index,
  label,
  groupRef,
}: {
  index: number;
  label: string;
  groupRef: (el: Group | null) => void;
}) {
  const y = BASE_Y + index * STEP;
  return (
    <group ref={groupRef} position={[STACK_X, y, 0]} scale={0.001}>
      <RoundedBox
        args={[LAYER_W, LAYER_H, LAYER_D]}
        radius={0.11}
        smoothness={5}
      >
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
        fontSize={0.23}
        color="#f4f1ea"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function PackFrame({ frameRef }: { frameRef: React.RefObject<Group | null> }) {
  const wordmark = useTexture("/hostwright-wordmark.png");
  return (
    <group ref={frameRef} position={[STACK_X, STACK_CENTER_Y, 0]} scale={0.001}>
      <RoundedBox
        args={[FRAME_W, FRAME_H, FRAME_D]}
        radius={0.16}
        smoothness={5}
      >
        <meshPhysicalMaterial
          color="#aeb2bc"
          roughness={0.22}
          metalness={0.8}
          clearcoat={0.85}
          clearcoatRoughness={0.12}
          envMapIntensity={1.5}
        />
      </RoundedBox>
      <mesh position={[0, FRAME_H / 2 - 0.02, 0]}>
        <boxGeometry args={[FRAME_W * 0.92, 0.03, FRAME_D * 0.92]} />
        <meshStandardMaterial
          color="#1f3a5f"
          emissive="#1f3a5f"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[0, 0, FRAME_D / 2 + 0.003]}>
        <planeGeometry args={[FRAME_W * 0.76, FRAME_H * 0.22]} />
        <meshStandardMaterial
          color="#20232a"
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, FRAME_D / 2 + 0.008]}>
        <planeGeometry args={[FRAME_W * 0.62, (FRAME_W * 0.62) / 5.9]} />
        <meshBasicMaterial alphaMap={wordmark} transparent color="#ffffff" />
      </mesh>
    </group>
  );
}

function Rig({
  layerRefs,
  lineRefs,
  frameRef,
}: {
  layerRefs: React.MutableRefObject<(Group | null)[]>;
  lineRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  frameRef: React.RefObject<Group | null>;
}) {
  const { camera } = useThree();
  const filmEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    filmEl.current = document.getElementById("terminal-build-film");
    camera.position.set(0.6, STACK_CENTER_Y * 0.4, 13.5);
    camera.lookAt(STACK_X - 0.4, STACK_CENTER_Y, 0);
  }, [camera]);

  useFrame(() => {
    let t = 0;
    const el = filmEl.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      t = MathUtils.clamp(-r.top / Math.max(total, 1), 0, 1);
    }

    LINE.forEach((line, i) => {
      if (i === 0) return; // always shown from first paint, not scroll-driven
      const isTyped = line.kind === "cmd";
      const progress = smoothstep(
        line.start,
        line.start + Math.max(line.dur, 0.001),
        t,
      );
      const lineEl = lineRefs.current[i];
      if (!lineEl) return;
      if (isTyped) {
        lineEl.textContent = line.text.slice(
          0,
          Math.floor(progress * line.text.length),
        );
      } else {
        lineEl.textContent = progress > 0.5 ? line.text : "";
      }
    });

    LAYERS.forEach((l, i) => {
      const src = LINE[l.lineIndex];
      const doneAt = src.start + src.dur;
      const pop = smoothstep(doneAt, doneAt + 0.05, t);
      const grp = layerRefs.current[i];
      if (grp) grp.scale.setScalar(Math.max(0.001, pop));
    });

    if (frameRef.current) {
      const pop = smoothstep(0.62, 0.75, t);
      frameRef.current.scale.setScalar(Math.max(0.001, pop));
    }
  });

  return (
    <>
      {LAYERS.map((l, i) => (
        <Layer
          key={l.label}
          index={i}
          label={l.label}
          groupRef={(el) => (layerRefs.current[i] = el)}
        />
      ))}
      <Suspense fallback={null}>
        <PackFrame frameRef={frameRef} />
      </Suspense>
      <ContactShadows
        position={[STACK_X, BASE_Y - 0.36, 0]}
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
          scale={[10, 8, 1]}
          color="#ffffff"
        />
      </Environment>
    </>
  );
}

function TerminalOverlay({
  lineRefs,
}: {
  lineRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
}) {
  return (
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
        pointerEvents: "none",
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
          fontSize: "12.5px",
          lineHeight: 1.75,
          whiteSpace: "pre-wrap",
          minHeight: "17rem",
        }}
      >
        {LINE.map((line, i) => (
          <div
            key={i}
            style={{ minHeight: "1.4em", color: KIND_COLOR[line.kind] }}
          >
            <span ref={(el) => (lineRefs.current[i] = el)}>
              {i === 0 ? line.text : ""}
            </span>
          </div>
        ))}
      </pre>
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

function TerminalBuildCanvas() {
  const layerRefs = useRef<(Group | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<Group | null>(null);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0.6, 0.2, 13.5], fov: 34 }}
        dpr={[1, 1.8]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 9, 7]} intensity={0.6} />
        <Rig layerRefs={layerRefs} lineRefs={lineRefs} frameRef={frameRef} />
      </Canvas>
      <TerminalOverlay lineRefs={lineRefs} />
    </div>
  );
}

export default function TerminalBuildScene() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 64rem)").matches;
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    setOk(wide && motionOk && webgl);
  }, []);

  if (!ok) return null;

  return <TerminalBuildCanvas />;
}
