import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
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

// The film: 16 Apple-style containers scroll-choreographed through three phases
// — drift (chaos) → dock onto the Hostwright control plane (order) → disperse
// into features. Progress `p` (0→1) is read from the #hero-film section each
// frame; one Rig owns all animation so nothing races.

const COUNT = 16;
const FEATURES = 6; // first 6 containers become feature reps on disperse

const smoothstep = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Deterministic pseudo-random so layout is stable across reloads.
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
};

function buildLayouts(): Layout[] {
  const out: Layout[] = [];
  for (let i = 0; i < COUNT; i++) {
    const r = rng(i * 9.17);
    const col = i % 4;
    const row = Math.floor(i / 4);
    const isFeature = i < FEATURES;
    out.push({
      drift: new Vector3(
        (r() - 0.5) * 13,
        (r() - 0.5) * 8,
        (r() - 0.5) * 7 - 1,
      ),
      driftRot: [(r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6],
      spin: [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.3],
      dock: new Vector3((col - 1.5) * 1.95, (row - 1.5) * 1.8 + 0.7, 0),
      disperse: isFeature
        ? new Vector3((i - (FEATURES - 1) / 2) * 2.5, 1.75, 1.6)
        : new Vector3((r() - 0.5) * 18, 7 + (i % 3) * 2, -9),
      isFeature,
    });
  }
  return out;
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
      <RoundedBox
        args={[12, 0.6, 5]}
        radius={0.18}
        smoothness={5}
        position={[0, 0, 0]}
      >
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
      {/* the wordmark, standing at the deck's front edge, facing camera. The PNG
          is dark ink on transparent, so we use its alpha as a mask and paint it
          light — legible against the dark deck. */}
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

function Rig() {
  const layouts = useMemo(buildLayouts, []);
  const refs = useRef<(Group | null)[]>([]);
  const deckRef = useRef<Group>(null);
  const deckMat = useRef<MeshPhysicalMaterial>(null);
  const deckWord = useRef<MeshBasicMaterial>(null);
  const { camera } = useThree();
  const progress = useRef(0);
  const filmEl = useRef<HTMLElement | null>(null);

  const camDrift = useMemo(() => new Vector3(0, 0.8, 12.5), []);
  const camDock = useMemo(() => new Vector3(0, 1.4, 13.2), []);
  const camDisperse = useMemo(() => new Vector3(0, 0.8, 14.5), []);
  const tmp = useMemo(() => new Vector3(), []);

  useEffect(() => {
    filmEl.current = document.getElementById("hero-film");
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Scroll progress across the tall film section.
    let p = 0;
    const el = filmEl.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      p = MathUtils.clamp(-r.top / Math.max(total, 1), 0, 1);
    }
    progress.current = p;
    window.dispatchEvent(new CustomEvent("hero-progress", { detail: p }));

    const a = smoothstep(0.12, 0.44, p); // drift -> dock
    const b = smoothstep(0.6, 0.9, p); // dock -> disperse

    // Camera keyframes.
    if (p < 0.5) tmp.lerpVectors(camDrift, camDock, smoothstep(0, 0.5, p));
    else tmp.lerpVectors(camDock, camDisperse, smoothstep(0.5, 1, p));
    camera.position.lerp(tmp, 0.08);
    camera.lookAt(0, 0.3, 0);

    // Containers.
    for (let i = 0; i < COUNT; i++) {
      const g = refs.current[i];
      const L = layouts[i];
      if (!g) continue;

      // position: drift -> dock -> disperse
      g.position.x = MathUtils.lerp(
        MathUtils.lerp(L.drift.x, L.dock.x, a),
        L.disperse.x,
        b,
      );
      g.position.y =
        MathUtils.lerp(
          MathUtils.lerp(L.drift.y, L.dock.y, a),
          L.disperse.y,
          b,
        ) +
        Math.sin(t * 0.5 + i) * 0.06 * a * (1 - b);
      g.position.z = MathUtils.lerp(
        MathUtils.lerp(L.drift.z, L.dock.z, a),
        L.disperse.z,
        b,
      );

      // rotation: tumble while drifting, settle face-on as it docks
      const idle = Math.sin(t * 0.4 + i) * 0.03 * a;
      g.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
      g.rotation.y = (L.driftRot[1] + t * L.spin[1]) * (1 - a) + idle;
      g.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);

      // non-feature containers shrink away during disperse
      const sc = L.isFeature ? 1 : MathUtils.lerp(1, 0.02, b);
      g.scale.setScalar(sc);
    }

    // Control plane rises in during dock, recedes on disperse.
    if (deckRef.current) {
      const y = MathUtils.lerp(MathUtils.lerp(-7, -2.7, a), -6, b);
      deckRef.current.position.y = y;
    }
    if (deckMat.current) {
      deckMat.current.opacity = a * (1 - b) * 0.96;
      deckMat.current.emissiveIntensity =
        (0.15 + Math.sin(t * 1.6) * 0.08) * a * (1 - b);
    }
    if (deckWord.current) {
      deckWord.current.opacity = a * (1 - b);
    }
  });

  return (
    <>
      <Suspense fallback={null}>
        <ControlPlane deckRef={deckRef} matRef={deckMat} wordRef={deckWord} />
      </Suspense>
      {layouts.map((_, i) => (
        <ContainerModel key={i} ref={(el) => (refs.current[i] = el)} />
      ))}
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

export default function HeroScene() {
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
      <Rig />
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
          bokehScale={3.5}
          height={480}
        />
      </EffectComposer>
    </Canvas>
  );
}
