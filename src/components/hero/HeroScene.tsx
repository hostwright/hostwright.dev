import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Group, MathUtils, MeshBasicMaterial, MeshPhysicalMaterial, Vector3 } from "three";
import ContainerModel from "./ContainerModel";
import DeltaCraft from "./DeltaCraft";
import FleetCube from "./FleetCube";
import HBridge, { TOWER_X, DECK_HALF_HEIGHT, DECK_Y } from "./HBridge";

// The film, 3 fast acts, driven by scroll progress p (0→1) read from
// #hero-film: drift → dock on the control plane → gather into ONE carried
// cube that a jet flies across the H-bridge, dropping one feature at a time
// into the open air beneath the span, then exits while the camera pulls back.

const COUNT = 18;
const FEATURES = 6;

const SLOT_XS = [-3.6, -2.16, -0.72, 0.72, 2.16, 3.6];
const SLOT_Y = DECK_Y - DECK_HALF_HEIGHT - 0.85; // hangs below the crossbar
const CROSS_START = 0.34;
const CROSS_END = 0.82;
const DROP_HALF = 0.022;

const DROP_CENTERS = SLOT_XS.map((x) => {
  const T = (x + 7.5) / 15;
  return CROSS_START + T * (CROSS_END - CROSS_START);
});

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
    out.push({
      drift: new Vector3((r() - 0.5) * 14, (r() - 0.5) * 8, (r() - 0.5) * 7 - 1),
      driftRot: [(r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6],
      spin: [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.3],
      dock: new Vector3((col - 2.5) * 1.35, (row - 1) * 1.35 + 0.6, 0),
      isFeature,
      featureIndex: isFeature ? i : -1,
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
      <RoundedBox args={[10, 0.55, 4.5]} radius={0.16} smoothness={5}>
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
      <mesh position={[0, 0.78, 1.7]}>
        <planeGeometry args={[4.8, 0.82]} />
        <meshBasicMaterial ref={wordRef} alphaMap={wordmark} transparent opacity={0} color="#efece3" />
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
  const craftRef = useRef<Group>(null);
  const cubeRef = useRef<Group>(null);
  const bridgeRef = useRef<Group>(null);
  const { camera } = useThree();
  const filmEl = useRef<HTMLElement | null>(null);

  const tmp = useMemo(() => new Vector3(), []);
  const tgt = useMemo(() => new Vector3(0, 0.3, 0), []);
  const craftPos = useMemo(() => new Vector3(), []);

  useEffect(() => {
    filmEl.current = document.getElementById("hero-film");
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    let p = 0;
    const el = filmEl.current;
    if (el) {
      const r = el.getBoundingClientRect();
      p = MathUtils.clamp(-r.top / Math.max(r.height - window.innerHeight, 1), 0, 1);
    }
    window.dispatchEvent(new CustomEvent("hero-progress", { detail: p }));

    let activeDrop = -1;
    for (let i = 0; i < DROP_CENTERS.length; i++) {
      if (p >= DROP_CENTERS[i] - DROP_HALF) activeDrop = i;
    }
    window.dispatchEvent(new CustomEvent("hero-drop", { detail: activeDrop }));

    const a = smoothstep(0.06, 0.18, p); // drift -> dock
    const g = smoothstep(0.18, 0.28, p); // dock -> single cube
    const cross = smoothstep(CROSS_START, CROSS_END, p); // jet flight 0->1

    craftPos.set(
      MathUtils.lerp(-8.5, 10, cross),
      MathUtils.lerp(2.4, 3.1, cross) + Math.sin(cross * Math.PI) * 0.5,
      MathUtils.lerp(-0.3, 0.5, cross),
    );

    for (let i = 0; i < COUNT; i++) {
      const m = refs.current[i];
      const L = layouts[i];
      if (!m) continue;

      const gx = MathUtils.lerp(L.drift.x, L.dock.x, a);
      const gy = MathUtils.lerp(L.drift.y, L.dock.y, a) + Math.sin(t * 0.5 + i) * 0.05 * a * (1 - g);
      const gz = MathUtils.lerp(L.drift.z, L.dock.z, a);

      m.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
      m.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);

      if (!L.isFeature) {
        m.position.set(gx, gy, gz);
        m.rotation.y = (L.driftRot[1] + t * L.spin[1]) * (1 - a);
        m.scale.setScalar(MathUtils.lerp(1, 0, g));
        continue;
      }

      // Feature containers: sit in the dock grid, then vanish into the cube —
      // they only reappear at their own drop moment, growing as they fall.
      const dropT = smoothstep(
        DROP_CENTERS[L.featureIndex] - DROP_HALF,
        DROP_CENTERS[L.featureIndex] + DROP_HALF,
        p,
      );
      const slotX = SLOT_XS[L.featureIndex];
      const emergeAt = new Vector3(craftPos.x, craftPos.y - 0.5, craftPos.z);

      m.position.x = MathUtils.lerp(MathUtils.lerp(gx, emergeAt.x, g), slotX, dropT);
      m.position.y = MathUtils.lerp(MathUtils.lerp(gy, emergeAt.y, g), SLOT_Y, dropT);
      m.position.z = MathUtils.lerp(MathUtils.lerp(gz, emergeAt.z, g), 0, dropT);
      m.rotation.y = (L.driftRot[1] + t * L.spin[1]) * (1 - a) + MathUtils.lerp(0, -0.1, dropT);

      // Hidden while gathered/riding; pops in as it starts to drop.
      const hiddenInCube = MathUtils.lerp(1, 0, g);
      const emerging = smoothstep(0, 0.3, dropT);
      m.scale.setScalar(dropT > 0 ? emerging : hiddenInCube);
    }

    // The single carried cube: forms at gather, rides the jet, drops away
    // once all six features have emerged.
    if (cubeRef.current) {
      const allDropped = activeDrop >= FEATURES - 1 ? smoothstep(DROP_CENTERS[FEATURES - 1], DROP_CENTERS[FEATURES - 1] + 0.05, p) : 0;
      const vis = g * (1 - allDropped);
      cubeRef.current.position.set(craftPos.x - 1.1, craftPos.y - 0.35, craftPos.z);
      cubeRef.current.rotation.y = t * 0.15;
      cubeRef.current.scale.setScalar(vis * 0.55);
    }

    // Jet: visible from just before it enters through just after it exits.
    if (craftRef.current) {
      const vis = smoothstep(0.3, 0.36, p) * (1 - smoothstep(0.84, 0.92, p));
      craftRef.current.position.copy(craftPos);
      craftRef.current.rotation.set(0.06, -0.35, 0.05);
      craftRef.current.scale.setScalar(vis * 0.4);
    }

    // H-bridge: fades in ahead of the crossing, holds through the reveal.
    if (bridgeRef.current) {
      const vis = smoothstep(0.22, 0.3, p) * (1 - smoothstep(0.99, 1, p));
      bridgeRef.current.scale.setScalar(0.001 + vis);
      bridgeRef.current.position.y = MathUtils.lerp(-1.4, 0, vis);
    }

    if (deckRef.current) deckRef.current.position.y = MathUtils.lerp(-2.3, -5, g);
    if (deckMat.current) deckMat.current.opacity = a * (1 - g) * 0.96;
    if (deckWord.current) deckWord.current.opacity = a * (1 - g);

    // Camera: dock framing -> a held, pulled-back bridge shot with real
    // breathing room -> ease back further for the final reveal.
    if (p < 0.18) {
      tmp.set(0, 0.7, 11).lerp(new Vector3(0, 1.1, 11.6), smoothstep(0, 0.18, p));
      tgt.set(0, 0.3, 0);
    } else if (p < 0.26) {
      const k = smoothstep(0.18, 0.26, p);
      tmp.set(0, 1.1, 11.6).lerp(new Vector3(0, 2.2, 21), k);
      tgt.set(0, 0.3, 0).lerp(new Vector3(0, 0.2, 0), k);
    } else if (p < 0.86) {
      tmp.set(0, 2.2, 21);
      tgt.set(0, 0.2, 0);
    } else {
      const k = smoothstep(0.86, 0.98, p);
      tmp.set(0, 2.2, 21).lerp(new Vector3(0, 2.8, 25.5), k);
      tgt.set(0, 0.2, 0).lerp(new Vector3(0, -0.2, 0), k);
    }
    camera.position.lerp(tmp, 0.09);
    camera.lookAt(tgt);
  });

  return (
    <>
      <Suspense fallback={null}>
        <ControlPlane deckRef={deckRef} matRef={deckMat} wordRef={deckWord} />
      </Suspense>
      <group ref={bridgeRef} scale={0.001}>
        <HBridge />
      </group>
      <group ref={craftRef} scale={0.001}>
        <DeltaCraft />
      </group>
      <group ref={cubeRef} scale={0.001}>
        <FleetCube />
      </group>
      {layouts.map((_, i) => (
        <ContainerModel key={i} ref={(el) => (refs.current[i] = el)} />
      ))}
    </>
  );
}

function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={3} position={[0, 6, 4]} scale={[16, 8, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={1.4} position={[-7, 2, 2]} scale={[4, 9, 1]} color="#fff3e2" />
      <Lightformer form="rect" intensity={1.7} position={[7, 3, -2]} scale={[4, 8, 1]} color="#edf1ff" />
      <Lightformer form="rect" intensity={2.2} position={[0, 3, -8]} scale={[14, 6, 1]} color="#ffffff" />
    </Environment>
  );
}

export default function HeroScene() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 64rem)").matches;
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      camera={{ position: [0, 0.7, 11], fov: 32 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 9, 7]} intensity={0.6} />
      <Rig />
      <ContactShadows position={[0, -3, 0]} opacity={0.28} scale={20} blur={3} far={7} resolution={512} color="#2a2620" />
      <Studio />
      <EffectComposer enableNormalPass={false}>
        <DepthOfField focusDistance={0.025} focalLength={0.045} bokehScale={2.6} height={480} />
      </EffectComposer>
    </Canvas>
  );
}
