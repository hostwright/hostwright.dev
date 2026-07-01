import { Canvas, useFrame } from "@react-three/fiber";
import {
  RoundedBox,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import { useMemo, useRef, useState, useEffect } from "react";
import { Group, MeshPhysicalMaterial, Color, MathUtils } from "three";
import type { Mesh } from "three";

// The fleet: charcoal container-monoliths that reconcile from a drifted
// "actual" scatter into their declared slots, then breathe and, now and then,
// drift one unit out and pull it back — the reconciliation loop as a calm
// spatial gesture. Lighting and material carry the premium; motion stays slow.

const INK = "#2c3036";
const SEAM = "#191c20";
const AMBER = "#c56a34";

type Slot = {
  pos: [number, number, number];
  size: [number, number, number];
  start: [number, number, number];
  delay: number;
  spin: number;
};

// A calm, airy cluster with real depth — a hero monolith and five companions.
const SLOTS: Slot[] = [
  {
    pos: [0, 0, 0],
    size: [1.5, 2.0, 1.5],
    start: [-2.6, 1.4, 1.6],
    delay: 0.0,
    spin: 0.25,
  },
  {
    pos: [-2.5, 0.8, -0.6],
    size: [1.0, 1.35, 1.0],
    start: [-4.4, -1.6, -1.8],
    delay: 0.12,
    spin: 0.4,
  },
  {
    pos: [2.5, -0.55, 0.5],
    size: [1.05, 1.45, 1.05],
    start: [4.8, 2.2, 1.6],
    delay: 0.08,
    spin: -0.35,
  },
  {
    pos: [-1.85, -1.35, 1.3],
    size: [0.85, 1.15, 0.85],
    start: [-3.0, -3.2, 3.0],
    delay: 0.22,
    spin: 0.5,
  },
  {
    pos: [1.75, 1.55, -1.0],
    size: [0.9, 1.2, 0.9],
    start: [3.2, 3.6, -2.6],
    delay: 0.16,
    spin: -0.45,
  },
  {
    pos: [0.4, -1.85, -1.5],
    size: [0.78, 1.02, 0.78],
    start: [0.6, -3.8, -3.2],
    delay: 0.26,
    spin: 0.3,
  },
];

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function Container({
  slot,
  index,
  drift,
}: {
  slot: Slot;
  index: number;
  drift: number;
}) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const seamMat = useRef<MeshPhysicalMaterial>(null);
  const amber = useMemo(() => new Color(AMBER), []);
  const off = useMemo(() => new Color("#000000"), []);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;

    const enter = MathUtils.clamp((t - slot.delay) / 1.8, 0, 1);
    const e = easeOutExpo(enter);
    const [sx, sy, sz] = slot.start;
    const [px, py, pz] = slot.pos;

    const bob = Math.sin(t * 0.6 + index * 1.3) * 0.06 * e;
    const sway = Math.cos(t * 0.45 + index * 0.9) * 0.05 * e;

    const isDrifting = drift === index;
    const driftAmt = isDrifting ? Math.sin(t * 1.3) * 0.5 + 0.5 : 0;

    m.position.x = MathUtils.lerp(sx, px + sway + driftAmt * 0.55, e);
    m.position.y = MathUtils.lerp(sy, py + bob + driftAmt * 0.22, e);
    m.position.z = MathUtils.lerp(sz, pz, e);
    m.rotation.y =
      slot.spin * (1 - e) +
      Math.sin(t * 0.25 + index) * 0.05 * e +
      driftAmt * 0.28;
    m.rotation.x = slot.spin * 0.5 * (1 - e) + driftAmt * 0.12;

    if (mat.current) {
      mat.current.emissive.lerp(isDrifting ? amber : off, 0.05);
      mat.current.emissiveIntensity = isDrifting
        ? driftAmt * 0.28
        : MathUtils.lerp(mat.current.emissiveIntensity, 0, 0.05);
    }
    if (seamMat.current) {
      seamMat.current.emissive.lerp(isDrifting ? amber : off, 0.06);
      seamMat.current.emissiveIntensity = isDrifting
        ? 0.5 + driftAmt * 0.6
        : MathUtils.lerp(seamMat.current.emissiveIntensity, 0, 0.06);
    }
  });

  const [w, h, d] = slot.size;
  return (
    <RoundedBox ref={mesh} args={[w, h, d]} radius={0.11} smoothness={6}>
      <meshPhysicalMaterial
        ref={mat}
        color={INK}
        roughness={0.34}
        metalness={0.35}
        clearcoat={0.7}
        clearcoatRoughness={0.28}
        reflectivity={0.6}
        envMapIntensity={1.5}
        emissive={"#000000"}
        emissiveIntensity={0}
      />
      {/* seam band — the logo's junction, wrapping each container's middle */}
      <mesh scale={[1.015, 1, 1.015]}>
        <boxGeometry args={[w, 0.05, d]} />
        <meshPhysicalMaterial
          ref={seamMat}
          color={SEAM}
          roughness={0.55}
          metalness={0}
          emissive={"#000000"}
          emissiveIntensity={0}
        />
      </mesh>
    </RoundedBox>
  );
}

function Fleet() {
  const group = useRef<Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const [drift, setDrift] = useState(-1);

  useEffect(() => {
    const id = setInterval(() => {
      setDrift(Math.floor(Math.random() * SLOTS.length));
      setTimeout(() => setDrift(-1), 2600);
    }, 5600);
    return () => clearInterval(id);
  }, []);

  // Parallax driven from the whole window, so it responds even though the
  // canvas itself is click-through (pointer-events: none) behind the copy.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      target.current.x * 0.26,
      0.04,
    );
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      -target.current.y * 0.14,
      0.04,
    );
  });

  // Composed well to the right so the headline sits over the clear left half.
  return (
    <group ref={group} position={[3.0, 0, 0]}>
      {SLOTS.map((s, i) => (
        <Container key={i} slot={s} index={i} drift={drift} />
      ))}
    </group>
  );
}

function Studio() {
  // Soft studio rig baked into the environment — the reflections it casts on
  // the charcoal are what make it read premium. No external HDRI (works offline).
  return (
    <Environment resolution={256}>
      <Lightformer
        form="rect"
        intensity={3.2}
        position={[0, 6, 4]}
        scale={[12, 7, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={1.5}
        position={[-6, 2, 2]}
        scale={[4, 8, 1]}
        color="#fff3e2"
      />
      <Lightformer
        form="rect"
        intensity={1.8}
        position={[6, 3, -2]}
        scale={[4, 7, 1]}
        color="#edf1ff"
      />
      <Lightformer
        form="rect"
        intensity={2.4}
        position={[0, 3, -7]}
        scale={[10, 5, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="ring"
        intensity={0.5}
        position={[0, -4, 4]}
        scale={[5, 5, 1]}
        color="#ffffff"
      />
    </Environment>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 6]} intensity={0.6} />
      <Fleet />
      <ContactShadows
        position={[0, -2.6, 0]}
        opacity={0.4}
        scale={18}
        blur={3}
        far={6}
        resolution={512}
        color="#2a2620"
      />
      <Studio />
      <EffectComposer enableNormalPass={false}>
        <DepthOfField
          focusDistance={0.012}
          focalLength={0.045}
          bokehScale={4}
          height={480}
        />
      </EffectComposer>
    </>
  );
}

export default function HeroScene() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 60rem)").matches;
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
      camera={{ position: [5.2, 2.5, 6.6], fov: 30 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
