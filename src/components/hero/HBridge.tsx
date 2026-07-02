import { RoundedBox } from "@react-three/drei";
import { forwardRef } from "react";
import type { Group } from "three";

// The Hostwright H, extruded into a real bridge: two towers (the mark's
// verticals) with truss bracing and suspension cables holding up a crossbar
// that IS the road — the logo carries the load. Charcoal + a navy accent to
// stay on-brand; the lavender cargo remains the only saturated color.

const CHARCOAL = "#262a30";
const EDGE = "#3a4048";
const ACCENT = "#1f3a5f";

export const TOWER_X = 5.2;
export const TOWER_HEIGHT = 8.5;
export const DECK_HALF_HEIGHT = 0.3; // crossbar args[1]/2
export const DECK_Y = 0; // crossbar center height

function Tower({ x }: { x: number }) {
  const inner = x < 0 ? 0.62 : -0.62;
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[1.2, TOWER_HEIGHT, 1.5]} radius={0.18} smoothness={5}>
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.4} metalness={0.4} clearcoat={0.4} clearcoatRoughness={0.4} envMapIntensity={1} />
      </RoundedBox>
      <mesh position={[inner, 0, 0.76]}>
        <boxGeometry args={[0.03, TOWER_HEIGHT * 0.94, 0.04]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// A diagonal truss strut from a tower face up to the crossbar underside.
function Strut({ towerX, sign }: { towerX: number; sign: 1 | -1 }) {
  const dx = sign * 1.55;
  const y0 = -1.7;
  const length = Math.hypot(dx, 1.7);
  const angle = Math.atan2(1.7, dx);
  return (
    <mesh position={[towerX + dx / 2, y0 / 2, 0]} rotation={[0, 0, angle - Math.PI / 2]}>
      <boxGeometry args={[0.18, length, 0.5]} />
      <meshPhysicalMaterial color={EDGE} roughness={0.42} metalness={0.4} clearcoat={0.3} />
    </mesh>
  );
}

// A suspension cable from a tower top down to the crossbar edge on that side.
function Cable({ towerX, sign }: { towerX: number; sign: 1 | -1 }) {
  const topY = TOWER_HEIGHT / 2 - 0.4;
  const deckEdgeX = towerX + sign * 1.4;
  const dx = deckEdgeX - towerX;
  const dy = DECK_Y + DECK_HALF_HEIGHT - topY;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  return (
    <mesh position={[towerX + dx / 2, topY + dy / 2, 0.5]} rotation={[0, 0, angle]}>
      <cylinderGeometry args={[0.035, 0.035, length, 8]} />
      <meshStandardMaterial color="#4a5058" roughness={0.5} metalness={0.6} />
    </mesh>
  );
}

const HBridge = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref}>
      <Tower x={-TOWER_X} />
      <Tower x={TOWER_X} />

      {/* truss bracing — the detail that actually reads "bridge" up close */}
      <Strut towerX={-TOWER_X} sign={1} />
      <Strut towerX={-TOWER_X} sign={-1} />
      <Strut towerX={TOWER_X} sign={1} />
      <Strut towerX={TOWER_X} sign={-1} />

      {/* suspension cables from each tower top to the near deck edge */}
      <Cable towerX={-TOWER_X} sign={1} />
      <Cable towerX={TOWER_X} sign={-1} />

      {/* the crossbar = the road span */}
      <RoundedBox args={[TOWER_X * 2 + 0.3, DECK_HALF_HEIGHT * 2, 3.0]} radius={0.1} smoothness={4} position={[0, DECK_Y, 0]}>
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.36} metalness={0.5} clearcoat={0.5} clearcoatRoughness={0.35} envMapIntensity={1.1} />
      </RoundedBox>
      <mesh position={[0, DECK_Y + DECK_HALF_HEIGHT, 1.42]}>
        <boxGeometry args={[TOWER_X * 2, 0.05, 0.07]} />
        <meshStandardMaterial color={EDGE} />
      </mesh>
      <mesh position={[0, DECK_Y + DECK_HALF_HEIGHT, -1.42]}>
        <boxGeometry args={[TOWER_X * 2, 0.05, 0.07]} />
        <meshStandardMaterial color={EDGE} />
      </mesh>
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
