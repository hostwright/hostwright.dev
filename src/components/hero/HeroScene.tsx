import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import {
  Group,
  MathUtils,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import ContainerModel from "./ContainerModel";
import HBridge, {
  DECK_HALF_HEIGHT,
  SHELF_Y_TOP,
  SHELF_Y_BOTTOM,
} from "./HBridge";

// The film: 18 Apple-style containers scroll-choreographed through three
// simple phases — drift (chaos) → dock onto the Hostwright control plane,
// packed edge to edge (order) → disperse to rest on the H's two shelves,
// three features per rung, spaced apart, names floating above each. No
// flying craft, no gimmicks — the fleet settles directly.

const COUNT = 18;
const FEATURES = 6;

// Three slots per shelf, spaced apart (unlike the tight dock grid).
const SHELF_SLOT_XS = [-2.3, 0, 2.3];
const REST_Y_TOP = SHELF_Y_TOP + DECK_HALF_HEIGHT + 0.78;
const REST_Y_BOTTOM = SHELF_Y_BOTTOM + DECK_HALF_HEIGHT + 0.78;

const smoothstep = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function rng(seed: number) {
  let s = seed + 1;
  return () => {
    s = Math.sin(s * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
}

type Layout = {
  drift: Vector3;
  driftRot: [number, number, number];
  spin: [number, number, number];
  dock: Vector3;
  disperse: Vector3;
  isFeature: boolean;
  featureIndex: number;
};

function buildLayouts(): Layout[] {
  const out: Layout[] = [];
  for (let i = 0; i < COUNT; i++) {
    const r = rng(i * 9.17);
    const col = i % 6;
    const row = Math.floor(i / 6);
    const isFeature = i < FEATURES;
    // First 3 features rest on the top shelf, next 3 on the bottom shelf.
    const onTop = i < 3;
    const shelfSlot = SHELF_SLOT_XS[i % 3];
    out.push({
      drift: new Vector3(
        (r() - 0.5) * 13,
        (r() - 0.5) * 8,
        (r() - 0.5) * 7 - 1,
      ),
      driftRot: [(r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6],
      spin: [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.3],
      // Tight, edge-to-edge — no gaps, a clean centred block.
      dock: new Vector3((col - 2.5) * 1.35, (row - 1) * 1.35 + 0.6, 0),
      disperse: isFeature
        ? new Vector3(shelfSlot, onTop ? REST_Y_TOP : REST_Y_BOTTOM, 0)
        : new Vector3((r() - 0.5) * 18, 7 + (i % 3) * 2, -9),
      isFeature,
      featureIndex: isFeature ? i : -1,
    });
  }
  return out;
}

const tagStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--color-text)",
  background: "var(--color-bg)",
  padding: "5px 11px",
  borderRadius: "999px",
  whiteSpace: "nowrap",
  boxShadow: "0 8px 20px -10px rgba(32,35,39,0.4)",
  pointerEvents: "none",
  opacity: 0,
  transition: "opacity 0.3s ease",
};

function FeatureContainer({
  layout,
  label,
  bRef,
}: {
  layout: Layout;
  label: string;
  bRef: React.RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const tag = useRef<HTMLDivElement>(null);

  useFrame((state) => {
    const gr = group.current;
    if (!gr) return;
    const t = state.clock.elapsedTime;
    const b = bRef.current ?? 0;

    gr.position.x = layout.disperse.x;
    gr.position.y = layout.disperse.y;
    gr.position.z = layout.disperse.z;

    gr.rotation.y = Math.sin(t * 0.3 + layout.featureIndex) * 0.02 * b;

    const emerging = smoothstep(0.05, 0.4, b);
    gr.scale.setScalar(MathUtils.lerp(0.001, 1, emerging));

    if (tag.current) {
      tag.current.style.opacity = b > 0.45 ? "1" : "0";
    }
  });

  return (
    <group ref={group}>
      <ContainerModel />
      <Html
        position={[0, 1.05, 0]}
        center
        distanceFactor={9}
        style={{ pointerEvents: "none" }}
      >
        <div ref={tag} style={tagStyle}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function ControlPlane({
  deckRef,
  matRef,
  wordRef,
}: {
  deckRef: React.RefObject<Group>;
  matRef: React.RefObject<MeshPhysicalMaterial>;
  wordRef: React.RefObject<MeshBasicMaterial>;
}) {
  const wordmark = useTexture("/hostwright-wordmark.png");
  return (
    <group ref={deckRef}>
      <RoundedBox args={[12, 0.6, 5]} radius={0.18} smoothness={5}>
        <meshPhysicalMaterial
          ref={matRef}
          color="#20232a"
          roughness={0.3}
          metalness={0.6}
          clearcoat={0.6}
          clearcoatRoughness={0.35}
          envMapIntensity={1.2}
          transparent
          opacity={0}
          emissive="#1f3a5f"
          emissiveIntensity={0}
        />
      </RoundedBox>
      <mesh position={[0, 0.85, 1.9]}>
        <planeGeometry args={[5.4, 0.92]} />
        <meshBasicMaterial
          ref={wordRef}
          alphaMap={wordmark}
          transparent
          opacity={0}
          color="#efece3"
        />
      </mesh>
    </group>
  );
}

function Rig({ stations }: { stations: { label: string; note: string }[] }) {
  const layouts = useMemo(buildLayouts, []);
  const refs = useRef<(Group | null)[]>([]);
  const deckRef = useRef<Group>(null);
  const deckMat = useRef<MeshPhysicalMaterial>(null);
  const deckWord = useRef<MeshBasicMaterial>(null);
  const bridgeRef = useRef<Group>(null);
  const { camera } = useThree();
  const filmEl = useRef<HTMLElement | null>(null);
  const bValue = useRef(0);

  const camDrift = useMemo(() => new Vector3(0, 0.8, 12.5), []);
  const camDock = useMemo(() => new Vector3(0, 1.4, 13.2), []);
  const camDisperse = useMemo(() => new Vector3(0, 1.2, 15.5), []);
  const tmp = useMemo(() => new Vector3(), []);

  useEffect(() => {
    filmEl.current = document.getElementById("hero-film");
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    let p = 0;
    const el = filmEl.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      p = MathUtils.clamp(-r.top / Math.max(total, 1), 0, 1);
    }
    window.dispatchEvent(new CustomEvent("hero-progress", { detail: p }));

    const a = smoothstep(0.12, 0.44, p); // drift -> dock
    const b = smoothstep(0.6, 0.9, p); // dock -> disperse
    bValue.current = b;

    if (p < 0.5) tmp.lerpVectors(camDrift, camDock, smoothstep(0, 0.5, p));
    else tmp.lerpVectors(camDock, camDisperse, smoothstep(0.5, 1, p));
    camera.position.lerp(tmp, 0.08);
    camera.lookAt(0, 0.6, 0);

    for (let i = 0; i < COUNT; i++) {
      const g = refs.current[i];
      const L = layouts[i];
      if (!g || L.isFeature) continue;

      const gx = MathUtils.lerp(L.drift.x, L.dock.x, a);
      const gy =
        MathUtils.lerp(L.drift.y, L.dock.y, a) +
        Math.sin(t * 0.5 + i) * 0.06 * a * (1 - b);
      const gz = MathUtils.lerp(L.drift.z, L.dock.z, a);

      g.position.x = MathUtils.lerp(gx, L.disperse.x, b);
      g.position.y = MathUtils.lerp(gy, L.disperse.y, b);
      g.position.z = MathUtils.lerp(gz, L.disperse.z, b);

      const idle = Math.sin(t * 0.4 + i) * 0.03 * a;
      g.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
      g.rotation.y = (L.driftRot[1] + t * L.spin[1]) * (1 - a) + idle;
      g.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);

      g.scale.setScalar(MathUtils.lerp(1, 0.02, b));
    }

    if (bridgeRef.current) {
      const vis = smoothstep(0.55, 0.68, p);
      bridgeRef.current.scale.setScalar(0.001 + vis);
      bridgeRef.current.position.y = MathUtils.lerp(-1.4, 0, vis);
    }

    if (deckRef.current)
      deckRef.current.position.y = MathUtils.lerp(
        MathUtils.lerp(-7, -2.7, a),
        -6,
        b,
      );
    if (deckMat.current) {
      deckMat.current.opacity = a * (1 - b) * 0.96;
      deckMat.current.emissiveIntensity =
        (0.15 + Math.sin(t * 1.6) * 0.08) * a * (1 - b);
    }
    if (deckWord.current) deckWord.current.opacity = a * (1 - b);
  });

  return (
    <>
      <Suspense fallback={null}>
        <ControlPlane deckRef={deckRef} matRef={deckMat} wordRef={deckWord} />
      </Suspense>
      <group ref={bridgeRef} scale={0.001}>
        <HBridge />
      </group>
      {layouts.map((L, i) =>
        L.isFeature ? (
          <FeatureContainer
            key={i}
            layout={L}
            label={stations[L.featureIndex]?.label ?? ""}
            bRef={bValue}
          />
        ) : (
          <ContainerModel key={i} ref={(el) => (refs.current[i] = el)} />
        ),
      )}
    </>
  );
}

function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer
        form="rect"
        intensity={3}
        position={[0, 6, 4]}
        scale={[14, 8, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={1.4}
        position={[-7, 2, 2]}
        scale={[4, 9, 1]}
        color="#fff3e2"
      />
      <Lightformer
        form="rect"
        intensity={1.7}
        position={[7, 3, -2]}
        scale={[4, 8, 1]}
        color="#edf1ff"
      />
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[0, 3, -8]}
        scale={[12, 6, 1]}
        color="#ffffff"
      />
    </Environment>
  );
}

interface HeroSceneProps {
  stations: { label: string; note: string }[];
}

export default function HeroScene({ stations }: HeroSceneProps) {
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

  return (
    <Canvas
      camera={{ position: [0, 0.8, 12.5], fov: 34 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 9, 7]} intensity={0.6} />
      <Rig stations={stations} />
      <ContactShadows
        position={[0, -3.4, 0]}
        opacity={0.32}
        scale={22}
        blur={3}
        far={7}
        resolution={512}
        color="#2a2620"
      />
      <Studio />
      <EffectComposer enableNormalPass={false}>
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
          height={480}
        />
      </EffectComposer>
    </Canvas>
  );
}
