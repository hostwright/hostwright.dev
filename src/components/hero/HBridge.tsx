import { RoundedBox } from "@react-three/drei";
import { forwardRef } from "react";
import type { Group } from "three";

// The Hostwright H, extruded into infrastructure: two towers (the mark's
// verticals) joined by a crossbar that IS the bridge road. The truck crosses
// the crossbar between the towers — the logo literally carries the load.
// Charcoal to match the site chrome; the lavender cargo stays the only color.

const CHARCOAL = "#262a30";
const EDGE = "#3a4048";
const ACCENT = "#1f3a5f";

const TOWER_X = 6.2;

function Tower({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[1.4, 11, 1.8]} radius={0.2} smoothness={5}>
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.4} metalness={0.4} clearcoat={0.4} clearcoatRoughness={0.4} envMapIntensity={1} />
      </RoundedBox>
      {/* a thin lit edge line up the inner face — structural accent */}
      <mesh position={[x < 0 ? 0.72 : -0.72, 0, 0.9]}>
        <boxGeometry args={[0.03, 10.4, 0.04]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

const HBridge = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref}>
      <Tower x={-TOWER_X} />
      <Tower x={TOWER_X} />

      {/* the crossbar = the road span the truck crosses */}
      <RoundedBox args={[TOWER_X * 2 + 0.4, 0.7, 3.6]} radius={0.12} smoothness={4} position={[0, 0, 0]}>
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.36} metalness={0.5} clearcoat={0.5} clearcoatRoughness={0.35} envMapIntensity={1.1} />
      </RoundedBox>
      {/* road edge rails */}
      <mesh position={[0, 0.37, 1.7]}>
        <boxGeometry args={[TOWER_X * 2, 0.06, 0.08]} />
        <meshStandardMaterial color={EDGE} />
      </mesh>
      <mesh position={[0, 0.37, -1.7]}>
        <boxGeometry args={[TOWER_X * 2, 0.06, 0.08]} />
        <meshStandardMaterial color={EDGE} />
      </mesh>
      {/* the seam — declared meets actual — glowing at the span's centre */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.06, 0.04, 3.4]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
});

HBridge.displayName = "HBridge";
export default HBridge;
