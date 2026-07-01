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

// The film, 4 acts, all driven by scroll progress p (0→1) read from #hero-film:
//   drift → dock on the control plane → gather into a cube a delta craft flies
//   through the H-portal → unpack into the six features. One Rig owns every
//   transform so nothing races.

const COUNT = 18;
const FEATURES = 6;
const CARGO_SCALE = 0.34;

const smoothstep = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

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
  cube: Vector3; // local offset inside the flying cube
  disperse: Vector3;
  isFeature: boolean;
};

function buildLayouts(): Layout[] {
  const out: Layout[] = [];
  const CG = 0.72;
  for (let i = 0; i < COUNT; i++) {
    const r = rng(i * 9.17);
    const col = i % 6;
    const row = Math.floor(i / 6);
    const isFeature = i < FEATURES;
    // 3×3×2 cube (a Rubik's face with depth)
    const cx = i % 3;
    const cy = Math.floor(i / 3) % 3;
    const cz = Math.floor(i / 9);
    out.push({
      drift: new Vector3(
        (r() - 0.5) * 14,
        (r() - 0.5) * 8,
        (r() - 0.5) * 7 - 1,
      ),
      driftRot: [(r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6],
      spin: [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.3],
      dock: new Vector3((col - 2.5) * 1.8, (row - 1) * 1.8 + 0.6, 0),
      cube: new Vector3((cx - 1) * CG, (cy - 1) * CG, (cz - 0.5) * CG * 1.4),
      disperse: isFeature
        ? new Vector3((i - (FEATURES - 1) / 2) * 2.5, 1.75, 1.6)
        : new Vector3((r() - 0.5) * 20, 8 + (i % 3) * 2, -10),
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
  const cubeV = useMemo(() => new Vector3(), []);

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

    const a = smoothstep(0.12, 0.32, p); // drift -> dock
    const g = smoothstep(0.36, 0.48, p); // dock -> cube (gather)
    const f = smoothstep(0.48, 0.68, p); // fly through the H
    const u = smoothstep(0.7, 0.84, p); // cube -> features (unpack)

    // Craft flight path: rises from the deck and arcs up-and-through the H.
    const ef = easeInOut(f);
    craftPos.set(
      MathUtils.lerp(-1.5, 10, ef),
      MathUtils.lerp(1.0, 5.2, ef) + Math.sin(f * Math.PI) * 1.4,
      MathUtils.lerp(0, 2.6, ef),
    );

    // Cube spins slowly as it flies.
    const cubeSpin = t * 0.3;
    const cs = Math.cos(cubeSpin);
    const sn = Math.sin(cubeSpin);

    for (let i = 0; i < COUNT; i++) {
      const m = refs.current[i];
      const L = layouts[i];
      if (!m) continue;

      // cube-world position (rides the craft, spinning)
      const lx = L.cube.x * cs - L.cube.z * sn;
      const lz = L.cube.x * sn + L.cube.z * cs;
      cubeV.set(craftPos.x + lx, craftPos.y - 1.7 + L.cube.y, craftPos.z + lz);

      // grid (drift->dock), then gather into cube, then unpack to feature
      const gx = MathUtils.lerp(L.drift.x, L.dock.x, a);
      const gy =
        MathUtils.lerp(L.drift.y, L.dock.y, a) +
        Math.sin(t * 0.5 + i) * 0.06 * a * (1 - g);
      const gz = MathUtils.lerp(L.drift.z, L.dock.z, a);

      m.position.x = MathUtils.lerp(
        MathUtils.lerp(gx, cubeV.x, g),
        L.disperse.x,
        u,
      );
      m.position.y = MathUtils.lerp(
        MathUtils.lerp(gy, cubeV.y, g),
        L.disperse.y,
        u,
      );
      m.position.z = MathUtils.lerp(
        MathUtils.lerp(gz, cubeV.z, g),
        L.disperse.z,
        u,
      );

      // rotation: tumble in drift, settle face-on, share the cube spin in flight
      m.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
      m.rotation.y =
        (L.driftRot[1] + t * L.spin[1]) * (1 - a) + cubeSpin * g * (1 - u);
      m.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);

      // scale: full -> cargo (gather) -> full (feature) / gone (flyaway)
      const gathered = MathUtils.lerp(1, CARGO_SCALE, g);
      const final = L.isFeature
        ? MathUtils.lerp(gathered, 1, u)
        : MathUtils.lerp(gathered, 0.02, u);
      m.scale.setScalar(final);
    }

    // Craft: visible from gather through unpack.
    if (craftRef.current) {
      const vis = smoothstep(0.34, 0.44, p) * (1 - smoothstep(0.82, 0.92, p));
      craftRef.current.position.copy(craftPos);
      craftRef.current.rotation.set(0.12, -0.5, 0.06);
      craftRef.current.scale.setScalar(vis * 1.15);
    }

    // H-portal: fades in for the crossing, out before the features land.
    if (bridgeRef.current) {
      const vis = smoothstep(0.3, 0.44, p) * (1 - smoothstep(0.7, 0.78, p));
      bridgeRef.current.scale.setScalar(0.001 + vis);
      bridgeRef.current.position.y = MathUtils.lerp(-3, 0.5, vis);
    }

    // Control plane: present during dock, gone once the cube gathers.
    if (deckRef.current) {
      deckRef.current.position.y = MathUtils.lerp(-2.7, -6, g);
    }
    if (deckMat.current) deckMat.current.opacity = a * (1 - g) * 0.96;
    if (deckWord.current) deckWord.current.opacity = a * (1 - g);

    // Camera: four framings, piecewise, with a moving look-at.
    if (p < 0.32) {
      tmp
        .set(0, 0.8, 12.5)
        .lerp(new Vector3(0, 1.4, 13.2), smoothstep(0, 0.32, p));
      tgt.set(0, 0.3, 0);
    } else if (p < 0.66) {
      const k = smoothstep(0.32, 0.66, p);
      tmp.set(0, 1.4, 13.2).lerp(new Vector3(6.5, 4.5, 17.5), k);
      tgt.set(0, 0.3, 0).lerp(new Vector3(3.5, 3.2, 0), k);
    } else {
      const k = smoothstep(0.66, 1, p);
      tmp.set(6.5, 4.5, 17.5).lerp(new Vector3(0, 0.9, 14.5), k);
      tgt.set(3.5, 3.2, 0).lerp(new Vector3(0, 0.4, 0), k);
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
          focalLength={0.04}
          bokehScale={2.6}
          height={480}
        />
      </EffectComposer>
    </Canvas>
  );
}
