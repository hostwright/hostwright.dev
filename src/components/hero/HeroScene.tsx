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
import DeltaCraft from "./DeltaCraft";
import FleetCube from "./FleetCube";
import HBridge, { TOWER_HEIGHT, DECK_HALF_HEIGHT, DECK_Y } from "./HBridge";

// The film, 3 fast acts, driven by scroll progress p (0→1) read from
// #hero-film: drift → dock on the control plane → gather into ONE carried
// cube that a jet flies OVER the suspension bridge, landing one feature at a
// time onto the deck (spaced apart, its name floating above it), then the jet
// exits while the camera pulls back to the finished row.

const COUNT = 18;
const FEATURES = 6;

const SLOT_XS = [-3.9, -2.34, -0.78, 0.78, 2.34, 3.9];
const SLOT_Y = DECK_Y + DECK_HALF_HEIGHT + 0.78; // resting on the deck surface
const JET_Y = TOWER_HEIGHT / 2 + 1.1; // clears the tower tops
const CROSS_START = 0.34;
const CROSS_END = 0.82;
const DROP_HALF = 0.022;

const DROP_CENTERS = SLOT_XS.map((x) => {
  const T = (x + 3.9) / 7.8;
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
      drift: new Vector3(
        (r() - 0.5) * 14,
        (r() - 0.5) * 8,
        (r() - 0.5) * 7 - 1,
      ),
      driftRot: [(r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6],
      spin: [(r() - 0.5) * 0.5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.3],
      dock: new Vector3((col - 2.5) * 1.35, (row - 1) * 1.35 + 0.6, 0),
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

type FilmShared = {
  p: number;
  a: number;
  g: number;
  emergeFrom: Vector3;
};

function FeatureContainer({
  layout,
  label,
  shared,
}: {
  layout: Layout;
  label: string;
  shared: React.RefObject<FilmShared>;
}) {
  const group = useRef<Group>(null);
  const tag = useRef<HTMLDivElement>(null);

  useFrame((state) => {
    const gr = group.current;
    const s = shared.current;
    if (!gr || !s) return;
    const t = state.clock.elapsedTime;

    const dropT = smoothstep(
      DROP_CENTERS[layout.featureIndex] - DROP_HALF,
      DROP_CENTERS[layout.featureIndex] + DROP_HALF,
      s.p,
    );
    const slotX = SLOT_XS[layout.featureIndex];

    const attachX = MathUtils.lerp(layout.drift.x, s.emergeFrom.x, s.g);
    const attachY = MathUtils.lerp(layout.drift.y, s.emergeFrom.y, s.g);
    const attachZ = MathUtils.lerp(layout.drift.z, s.emergeFrom.z, s.g);

    gr.position.x = MathUtils.lerp(attachX, slotX, dropT);
    gr.position.y = MathUtils.lerp(attachY, SLOT_Y, dropT);
    gr.position.z = MathUtils.lerp(attachZ, 0, dropT);

    gr.rotation.x = (layout.driftRot[0] + t * layout.spin[0]) * (1 - s.a);
    gr.rotation.y =
      (layout.driftRot[1] + t * layout.spin[1]) * (1 - s.a) +
      MathUtils.lerp(0, -0.08, dropT);
    gr.rotation.z = (layout.driftRot[2] + t * layout.spin[2]) * (1 - s.a);

    const hiddenInCube = MathUtils.lerp(1, 0, s.g);
    const emerging = smoothstep(0, 0.3, dropT);
    gr.scale.setScalar(dropT > 0 ? emerging : hiddenInCube);

    if (tag.current) {
      tag.current.style.opacity = dropT > 0.35 ? "1" : "0";
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
  const craftRef = useRef<Group>(null);
  const cubeRef = useRef<Group>(null);
  const bridgeRef = useRef<Group>(null);
  const { camera } = useThree();
  const filmEl = useRef<HTMLElement | null>(null);

  const tmp = useMemo(() => new Vector3(), []);
  const tgt = useMemo(() => new Vector3(0, 0.3, 0), []);
  const craftPos = useMemo(() => new Vector3(), []);
  const shared = useRef<FilmShared>({
    p: 0,
    a: 0,
    g: 0,
    emergeFrom: new Vector3(),
  });

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

    const a = smoothstep(0.06, 0.18, p);
    const g = smoothstep(0.18, 0.28, p);
    const cross = smoothstep(CROSS_START, CROSS_END, p);

    craftPos.set(
      MathUtils.lerp(-8.5, 10, cross),
      JET_Y + Math.sin(cross * Math.PI) * 0.4,
      MathUtils.lerp(-0.3, 0.5, cross),
    );

    const s = shared.current;
    s.p = p;
    s.a = a;
    s.g = g;
    s.emergeFrom.set(craftPos.x, craftPos.y - 1.6, craftPos.z);

    for (let i = 0; i < COUNT; i++) {
      const m = refs.current[i];
      const L = layouts[i];
      if (!m || L.isFeature) continue;

      const gx = MathUtils.lerp(L.drift.x, L.dock.x, a);
      const gy =
        MathUtils.lerp(L.drift.y, L.dock.y, a) +
        Math.sin(t * 0.5 + i) * 0.05 * a * (1 - g);
      const gz = MathUtils.lerp(L.drift.z, L.dock.z, a);

      m.position.set(gx, gy, gz);
      m.rotation.x = (L.driftRot[0] + t * L.spin[0]) * (1 - a);
      m.rotation.y = (L.driftRot[1] + t * L.spin[1]) * (1 - a);
      m.rotation.z = (L.driftRot[2] + t * L.spin[2]) * (1 - a);
      m.scale.setScalar(MathUtils.lerp(1, 0, g));
    }

    if (cubeRef.current) {
      let activeDrop = -1;
      for (let i = 0; i < DROP_CENTERS.length; i++) {
        if (p >= DROP_CENTERS[i] - DROP_HALF) activeDrop = i;
      }
      const allDropped =
        activeDrop >= FEATURES - 1
          ? smoothstep(
              DROP_CENTERS[FEATURES - 1],
              DROP_CENTERS[FEATURES - 1] + 0.05,
              p,
            )
          : 0;
      const vis = g * (1 - allDropped);
      cubeRef.current.position.set(
        craftPos.x - 1.1,
        craftPos.y - 0.35,
        craftPos.z,
      );
      cubeRef.current.rotation.y = t * 0.15;
      cubeRef.current.scale.setScalar(vis * 0.55);
    }

    if (craftRef.current) {
      const vis = smoothstep(0.3, 0.36, p) * (1 - smoothstep(0.84, 0.92, p));
      craftRef.current.position.copy(craftPos);
      craftRef.current.rotation.set(0.04, -0.35, 0.03);
      craftRef.current.scale.setScalar(vis * 0.62);
    }

    if (bridgeRef.current) {
      const vis = smoothstep(0.22, 0.3, p) * (1 - smoothstep(0.99, 1, p));
      bridgeRef.current.scale.setScalar(0.001 + vis);
      bridgeRef.current.position.y = MathUtils.lerp(-1.4, 0, vis);
    }

    if (deckRef.current)
      deckRef.current.position.y = MathUtils.lerp(-2.3, -5, g);
    if (deckMat.current) deckMat.current.opacity = a * (1 - g) * 0.96;
    if (deckWord.current) deckWord.current.opacity = a * (1 - g);

    if (p < 0.18) {
      tmp
        .set(0, 0.7, 11)
        .lerp(new Vector3(0, 1.1, 11.6), smoothstep(0, 0.18, p));
      tgt.set(0, 0.3, 0);
    } else if (p < 0.26) {
      const k = smoothstep(0.18, 0.26, p);
      tmp.set(0, 1.1, 11.6).lerp(new Vector3(0, 4.4, 23.5), k);
      tgt.set(0, 0.3, 0).lerp(new Vector3(0, 2.3, 0), k);
    } else if (p < 0.86) {
      tmp.set(0, 4.4, 23.5);
      tgt.set(0, 2.3, 0);
    } else {
      const k = smoothstep(0.86, 0.98, p);
      tmp.set(0, 4.4, 23.5).lerp(new Vector3(0, 4.6, 27), k);
      tgt.set(0, 2.3, 0).lerp(new Vector3(0, 1.6, 0), k);
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
      {layouts.map((L, i) =>
        L.isFeature ? (
          <FeatureContainer
            key={i}
            layout={L}
            label={stations[L.featureIndex]?.label ?? ""}
            shared={shared}
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
      camera={{ position: [0, 0.7, 11], fov: 32 }}
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
        position={[0, -3, 0]}
        opacity={0.28}
        scale={20}
        blur={3}
        far={7}
        resolution={512}
        color="#2a2620"
      />
      <Studio />
      <EffectComposer enableNormalPass={false}>
        <DepthOfField
          focusDistance={0.03}
          focalLength={0.045}
          bokehScale={2.4}
          height={480}
        />
      </EffectComposer>
    </Canvas>
  );
}
