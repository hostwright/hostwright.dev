import { RoundedBox } from "@react-three/drei";
import { forwardRef } from "react";
import type { Group } from "three";

// The Hostwright H, drawn with its natural double crossbar: two towers and
// two shelves — an upper rung and a lower rung — the mark itself, standing as
// a two-tier platform the features rest on. No cables, no trusses; the seam
// glow on each shelf is the only flourish, tying back to the reconciliation
// motif (declared meets actual, twice over).

const CHARCOAL = "#262a30";
const DECK_SILVER = "#8b8f98";
const ACCENT = "#1f3a5f";

export const TOWER_X = 4.0;
export const TOWER_HEIGHT = 6.0;
export const DECK_HALF_HEIGHT = 0.24;
export const SHELF_Y_TOP = 1.3;
export const SHELF_Y_BOTTOM = -1.3;

function Tower({ x }: { x: number }) {
  const inner = x < 0 ? 0.54 : -0.54;
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[1.05, TOWER_HEIGHT, 1.3]} radius={0.14} smoothness={5}>
        <meshPhysicalMaterial
          color={CHARCOAL}
          roughness={0.4}
          metalness={0.4}
          clearcoat={0.4}
          clearcoatRoughness={0.4}
          envMapIntensity={1}
        />
      </RoundedBox>
      <mesh position={[inner, 0, 0.66]}>
        <boxGeometry args={[0.03, TOWER_HEIGHT * 0.94, 0.04]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function Shelf({ y }: { y: number }) {
  return (
    <group>
      <RoundedBox
        args={[TOWER_X * 2 + 0.3, DECK_HALF_HEIGHT * 2, 3.0]}
        radius={0.1}
        smoothness={4}
        position={[0, y, 0]}
      >
        <meshPhysicalMaterial
          color={DECK_SILVER}
          roughness={0.34}
          metalness={0.55}
          clearcoat={0.55}
          clearcoatRoughness={0.3}
          envMapIntensity={1.2}
        />
      </RoundedBox>
      {/* the seam — declared meets actual — glowing at each shelf's centre */}
      <mesh position={[0, y + DECK_HALF_HEIGHT + 0.01, 0]}>
        <boxGeometry args={[0.06, 0.03, 2.8]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.75}
        />
      </mesh>
    </group>
  );
}

const HBridge = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref}>
      <Tower x={-TOWER_X} />
      <Tower x={TOWER_X} />
      <Shelf y={SHELF_Y_TOP} />
      <Shelf y={SHELF_Y_BOTTOM} />
    </group>
  );
});

HBridge.displayName = "HBridge";
export default HBridge;
