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
import DeltaCraft from "./DeltaCraft";
import HBridge from "./HBridge";

// The film, 3 acts, all driven by scroll progress p (0→1) read from #hero-film:
//   drift → dock on the control plane → gather into a small flying tray that a
// delta craft carries across the H-bridge, dropping one feature container onto
// the deck at a time, then flies out while the camera pulls back. One Rig owns
// every transform so nothing races.

const COUNT = 18;
const FEATURES = 6;
const CARGO_SCALE = 0.34;

// Bridge geometry (must match src/components/hero/HBridge.tsx).
const TOWER_X = 6.2;
const DECK_Y = 0.42; // crossbar top surface
const SLOT_XS = [-4.6, -2.76, -0.92, 0.92, 2.76, 4.6];
const SLOT_Y = DECK_Y + 0.75; // container half-height rests on the deck
const CROSS_START = 0.34;
const CROSS_END = 0.9;
const DROP_HALF = 0.026;

// Drop centers: evenly spaced across the crossing so each feature lands while
// the craft is roughly over its slot (linear inverse of the smoothstep below).
const DROP_CENTERS = SLOT_XS.map((x) => {
  const T = (x + 9) / 20;
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
  tray: Vector3; // local offset in the flying tray (features only)
  isFeature: boolean;
  featureIndex: number; // -1 for fillers
};

function buildLayouts(): Layout[] {
  const out: Layout[] = [];
  const TG = 0.95;
  for (let i = 0; i < COUNT; i++) {
    const r = rng(i * 9.17);
    const col = i % 6;
    const row = Math.floor(i / 6);
    const isFeature = i < FEATURES;
    const tx = (i % 3) - 1;
    const ty = Math.floor(i / 3) - 0.5;
    out.push({
      drift: new Vector3(
        (r() - 0.5) * 14,
        (r() - 0.5) * 8,
        (r() - 0.5) * 7 - 1,
      ),
      driftRot: [(r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6],
      spin: [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.3],
      dock: new Vector3((col - 2.5) * 1.8, (row - 1) * 1.8 + 0.6, 0),
      tray: new Vector3(tx * TG, ty * TG, 0),
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

function Rig() {
  const layouts = useMemo(buildLayouts, []);
  const refs = useRef<(Group | null)[]>([]);
  const deckRef = useRef<Group>(null);
  const deckMat = useRef<MeshPhysicalMaterial>(null);
  const deckWord = useRef<MeshBasicMaterial>(null);
  const craftRef = useRef<Group>(null);
  const bridgeRef = useRef<Group>(null);
  const { camera } = useThree();
  const filmEl = useRef<HTMLElement | null>(null);

  const tmp = useMemo(() => new Vector3(), []);
  const tgt = useMemo(() => new Vector3(0, 0.3, 0), []);
  const craftPos = useMemo(() => new Vector3(), []);
  const trayV = useMemo(() => new Vector3(), []);

  useEffect(() => {
    filmEl.current = document.getElementById("hero-film");
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    let p = 0;
    const el = filmEl.current;
    if (el) {
      const r = el.getBoundingClientRect();
      p = MathUtils.clamp(
        -r.top / Math.max(r.height - window.innerHeight, 1),
        0,
        1,
      );
    }
    window.dispatchEvent(new CustomEvent("hero-progress", { detail: p }));

    // Report which feature just dropped (or -1) so the caption can swap.
    let activeDrop = -1;
    for (let i = 0; i < DROP_CENTERS.length; i++) {
      if (p >= DROP_CENTERS[i] - DROP_HALF) activeDrop = i;
    }
    window.dispatchEvent(new CustomEvent("hero-drop", { detail: activeDrop }));

    const a = smoothstep(0.1, 0.28, p); // drift -> dock
    const g = smoothstep(0.28, 0.4, p); // dock -> gather into tray
    const cross = smoothstep(CROSS_START, CROSS_END, p); // craft flight 0->1

    // Craft flight: enters before the left tower, exits well past the right.
    craftPos.set(
      MathUtils.lerp(-9.5, 11.5, cross),
      MathUtils.lerp(2.6, 3.4, cross) + Math.sin(cross * Math.PI) * 0.6,
      MathUtils.lerp(-0.4, 0.6, cross),
    );

    for (let i = 0; i < COUNT; i++) {
      const m = refs.current[i];
      const L = layouts[i];
      if (!m) continue;

      // grid (drift -> dock)
      const gx = MathUtils.lerp(L.drift.x, L.dock.x, a);
      const gy =
        MathUtils.lerp(L.drift.y, L.dock.y, a) +
        Math.sin(t * 0.5 + i) * 0.06 * a * (1 - g);
      const gz = MathUtils.lerp(L.drift.z, L.dock.z, a);

      if (!L.isFeature) {
        // Filler containers dissolve away entirely once gathered.
        m.position.set(gx, gy, gz);
        m.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
        m.rotation.y = (L.driftRot[1] + t * L.spin[1]) * (1 - a);
        m.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);
        m.scale.setScalar(MathUtils.lerp(1, 0, g));
        continue;
      }

      // Feature container: grid -> tray (riding the craft) -> its bridge slot.
      trayV.set(
        craftPos.x + L.tray.x,
        craftPos.y + L.tray.y,
        craftPos.z + L.tray.z,
      );
      const attachX = MathUtils.lerp(gx, trayV.x, g);
      const attachY = MathUtils.lerp(gy, trayV.y, g);
      const attachZ = MathUtils.lerp(gz, trayV.z, g);

      const dropT = smoothstep(
        DROP_CENTERS[L.featureIndex] - DROP_HALF,
        DROP_CENTERS[L.featureIndex] + DROP_HALF,
        p,
      );
      const slotX = SLOT_XS[L.featureIndex];

      m.position.x = MathUtils.lerp(attachX, slotX, dropT);
      m.position.y = MathUtils.lerp(attachY, SLOT_Y, dropT);
      m.position.z = MathUtils.lerp(attachZ, 0, dropT);

      m.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
      m.rotation.y =
        (L.driftRot[1] + t * L.spin[1]) * (1 - a) * (1 - g) +
        MathUtils.lerp(0, -0.12, dropT);
      m.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);

      const cargoScale = MathUtils.lerp(1, CARGO_SCALE, g);
      m.scale.setScalar(MathUtils.lerp(cargoScale, 1, dropT));
    }

    // Craft visible from just before it enters through just after it exits.
    if (craftRef.current) {
      const vis = smoothstep(0.3, 0.38, p) * (1 - smoothstep(0.9, 0.97, p));
      craftRef.current.position.copy(craftPos);
      craftRef.current.rotation.set(0.08, -0.4, 0.04);
      craftRef.current.scale.setScalar(vis * 0.55);
    }

    // H-bridge: fades in ahead of the crossing, stays through the reveal.
    if (bridgeRef.current) {
      const vis = smoothstep(0.26, 0.36, p) * (1 - smoothstep(0.99, 1, p));
      bridgeRef.current.scale.setScalar(0.001 + vis);
      bridgeRef.current.position.y = MathUtils.lerp(-2, 0, vis);
    }

    // Control plane: present during dock, gone once the tray gathers.
    if (deckRef.current)
      deckRef.current.position.y = MathUtils.lerp(-2.7, -6, g);
    if (deckMat.current) deckMat.current.opacity = a * (1 - g) * 0.96;
    if (deckWord.current) deckWord.current.opacity = a * (1 - g);

    // Camera: dock framing -> a held, bridge-fit shot for the whole crossing
    // -> pull back to reveal all six landed containers before releasing.
    if (p < 0.28) {
      tmp
        .set(0, 0.8, 12.5)
        .lerp(new Vector3(0, 1.4, 13.2), smoothstep(0, 0.28, p));
      tgt.set(0, 0.3, 0);
    } else if (p < 0.34) {
      const k = smoothstep(0.28, 0.34, p);
      tmp.set(0, 1.4, 13.2).lerp(new Vector3(0, 2.6, 20.5), k);
      tgt.set(0, 0.3, 0).lerp(new Vector3(0, 0.6, 0), k);
    } else if (p < 0.88) {
      tmp.set(0, 2.6, 20.5);
      tgt.set(0, 0.6, 0);
    } else {
      const k = smoothstep(0.88, 0.98, p);
      tmp.set(0, 2.6, 20.5).lerp(new Vector3(0, 3.6, 25), k);
      tgt.set(0, 0.6, 0).lerp(new Vector3(0, 0.9, 0), k);
    }
    camera.position.lerp(tmp, 0.08);
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
        scale={[16, 8, 1]}
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
        scale={[14, 6, 1]}
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
        opacity={0.3}
        scale={22}
        blur={3}
        far={7}
        resolution={512}
        color="#2a2620"
      />
      <Studio />
      <EffectComposer enableNormalPass={false}>
        <DepthOfField
          focusDistance={0.025}
          focalLength={0.045}
          bokehScale={2.8}
          height={480}
        />
      </EffectComposer>
    </Canvas>
  );
}
