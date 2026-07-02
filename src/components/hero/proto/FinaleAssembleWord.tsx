import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { type Group, type Mesh, MathUtils, Vector3 } from "three";
import ContainerModel from "../ContainerModel";
import HBridge from "../HBridge";
import { FEATURE_REST_SCALE, STATIONS, slotPosition, smoothstep } from "./finaleShared";

// Concept C: no per-step words. Each container ejects a spark that arcs
// upward and converges into a single glowing word above the bridge.

const LOOP = 8;
const TARGET = new Vector3(0, 4.2, 0);

function Spark({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  const from = new Vector3(...slotPosition(index));

  useFrame((state) => {
    const t = (state.clock.elapsedTime % LOOP) / LOOP;
    const start = index * 0.06;
    const travel = smoothstep(start, start + 0.32, t);
    const fade = smoothstep(0.55, 0.68, t);
    const p = new Vector3().lerpVectors(from, TARGET, travel);
    p.y += Math.sin(travel * Math.PI) * 1.1;
    if (ref.current) {
      ref.current.position.copy(p);
      ref.current.scale.setScalar(Math.max(0.001, MathUtils.lerp(1, 0.001, fade)));
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshBasicMaterial color="#f0a83c" />
    </mesh>
  );
}

function WordReveal() {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % LOOP) / LOOP;
    const s = smoothstep(0.56, 0.7, t) - smoothstep(0.9, 1.0, t);
    if (ref.current) ref.current.scale.setScalar(Math.max(0.001, s));
  });

  return (
    <group ref={ref} position={[0, 4.2, 0]}>
      <Text fontSize={0.85} color="#20232a" anchorX="center" anchorY="middle">
        HOSTWRIGHT
      </Text>
    </group>
  );
}

function Scene() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.0, 15);
    camera.lookAt(0, 0.8, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 7]} intensity={0.6} />
      <HBridge />
      {STATIONS.map((_, i) => (
        <group key={i} position={slotPosition(i)} scale={FEATURE_REST_SCALE}>
          <ContainerModel />
        </group>
      ))}
      {STATIONS.map((_, i) => (
        <Spark key={i} index={i} />
      ))}
      <WordReveal />
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

export default function FinaleAssembleWord() {
  return (
    <Canvas
      camera={{ position: [0, 1.0, 15], fov: 34 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "#f4f1ea" }}
    >
      <Scene />
    </Canvas>
  );
}
