import { RoundedBox } from "@react-three/drei";
import { forwardRef } from "react";
import type { Group } from "three";

// The Hostwright H, kept simple: two towers and a crossbar — the mark itself,
// standing as a platform the features rest on. No cables, no trusses; the
// seam glow is the only flourish, tying it back to the reconciliation motif.

const CHARCOAL = "#262a30";
const DECK_SILVER = "#8b8f98";
const ACCENT = "#1f3a5f";

export const TOWER_X = 5.2;
export const TOWER_HEIGHT = 7.5;
export const DECK_HALF_HEIGHT = 0.3;
export const DECK_Y = 0;

function Tower({ x }: { x: number }) {
  const inner = x < 0 ? 0.62 : -0.62;
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[1.2, TOWER_HEIGHT, 1.5]} radius={0.16} smoothness={5}>
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.4} metalness={0.4} clearcoat={0.4} clearcoatRoughness={0.4} envMapIntensity={1} />
      </RoundedBox>
      <mesh position={[inner, 0, 0.76]}>
        <boxGeometry args={[0.03, TOWER_HEIGHT * 0.94, 0.04]} />
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

      {/* the crossbar — a clean silver deck, the platform the features stand on */}
      <RoundedBox args={[TOWER_X * 2 + 0.3, DECK_HALF_HEIGHT * 2, 3.0]} radius={0.1} smoothness={4} position={[0, DECK_Y, 0]}>
        <meshPhysicalMaterial color={DECK_SILVER} roughness={0.34} metalness={0.55} clearcoat={0.55} clearcoatRoughness={0.3} envMapIntensity={1.2} />
      </RoundedBox>
      {/* the seam — declared meets actual — glowing at the span's centre */}
      <mesh position={[0, DECK_Y + DECK_HALF_HEIGHT + 0.01, 0]}>
        <boxGeometry args={[0.06, 0.03, 2.8]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.75} />
      </mesh>
    </group>
  );
});

HBridge.displayName = "HBridge";
export default HBridge;
