import { RoundedBox } from "@react-three/drei";
import { forwardRef } from "react";
import type { Group } from "three";

// One compact block, sized like a single container, engraved with a 4×4 grid
// to read as "the whole fleet, packed into one" — what the craft actually
// carries across the bridge, instead of a cluttered swarm riding along.

const BODY = "#7c80a4";
const FACE = "#c7c9db";
const GROUT = "#565a74";

const FleetCube = forwardRef<Group>((_, ref) => {
  const lines = [-0.45, -0.15, 0.15, 0.45];
  return (
    <group ref={ref}>
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.16} smoothness={5}>
        <meshPhysicalMaterial color={BODY} roughness={0.34} metalness={0.15} clearcoat={0.6} clearcoatRoughness={0.3} envMapIntensity={1.2} />
      </RoundedBox>
      {/* front face plate, gridded 4x4 to read as sixteen packed into one */}
      <RoundedBox args={[1.3, 1.3, 0.04]} radius={0.1} smoothness={4} position={[0, 0, 0.76]}>
        <meshPhysicalMaterial color={FACE} roughness={0.3} metalness={0.08} clearcoat={0.5} envMapIntensity={1.2} />
      </RoundedBox>
      {lines.map((x, i) => (
        <mesh key={`v${i}`} position={[x, 0, 0.79]}>
          <boxGeometry args={[0.018, 1.28, 0.02]} />
          <meshStandardMaterial color={GROUT} />
        </mesh>
      ))}
      {lines.map((y, i) => (
        <mesh key={`h${i}`} position={[0, y, 0.79]}>
          <boxGeometry args={[1.28, 0.018, 0.02]} />
          <meshStandardMaterial color={GROUT} />
        </mesh>
      ))}
      {/* same grid on top, visible from the flying ¾ camera angle */}
      <RoundedBox args={[1.3, 0.04, 1.3]} radius={0.1} smoothness={4} position={[0, 0.76, 0]}>
        <meshPhysicalMaterial color={FACE} roughness={0.3} metalness={0.08} clearcoat={0.5} envMapIntensity={1.2} />
      </RoundedBox>
      {lines.map((x, i) => (
        <mesh key={`tv${i}`} position={[x, 0.79, 0]}>
          <boxGeometry args={[0.018, 0.02, 1.28]} />
          <meshStandardMaterial color={GROUT} />
        </mesh>
      ))}
      {lines.map((z, i) => (
        <mesh key={`th${i}`} position={[0, 0.79, z]}>
          <boxGeometry args={[1.28, 0.02, 0.018]} />
          <meshStandardMaterial color={GROUT} />
        </mesh>
      ))}
    </group>
  );
});

FleetCube.displayName = "FleetCube";
export default FleetCube;
