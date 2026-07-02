import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { DoubleSide, type Group } from "three";
import ContainerModel from "../ContainerModel";
import HBridge from "../HBridge";
import { FEATURE_REST_SCALE, STATIONS, slotPosition, smoothstep } from "./finaleShared";

// Concept B: a flip-card hovers above each container and spins 180° in
// sequence (departure-board energy), revealing its word before spinning back.

const LOOP = 8;

function Flap({ index, label }: { index: number; label: string }) {
  const spin = useRef<Group>(null);
  const pos = slotPosition(index);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % LOOP) / LOOP;
    const start = index * 0.09;
    const on =
      smoothstep(start, start + 0.15, t) - smoothstep(start + 0.4, start + 0.55, t);
    if (spin.current) spin.current.rotation.y = Math.PI * on;
  });

  return (
    <group position={[pos[0], pos[1] + 1.05, pos[2]]}>
      <group ref={spin}>
        <mesh>
          <planeGeometry args={[1.7, 0.6]} />
          <meshStandardMaterial color="#efece3" side={DoubleSide} />
        </mesh>
        <Text
          rotation={[0, Math.PI, 0]}
          position={[0, 0, -0.006]}
          fontSize={0.19}
          color="#1f3a5f"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

function Scene() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.0, 15);
    camera.lookAt(0, 0.4, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 9, 7]} intensity={0.6} />
      <HBridge />
      {STATIONS.map((s, i) => (
        <group key={i} position={slotPosition(i)} scale={FEATURE_REST_SCALE}>
          <ContainerModel />
        </group>
      ))}
      {STATIONS.map((s, i) => (
        <Flap key={i} index={i} label={s.label} />
      ))}
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

export default function FinaleSplitFlap() {
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
