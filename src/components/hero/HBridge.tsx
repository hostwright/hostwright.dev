import { RoundedBox } from "@react-three/drei";
import { forwardRef, useMemo } from "react";
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group } from "three";

// A suspension bridge, formal and clean — the Golden Gate's silhouette
// (towers, draping main cables, vertical suspenders) rebuilt in our own
// charcoal + navy language, not its color. This is what actually reads as
// "bridge" at a glance; the H is the towers-and-span structure, not a color.

const CHARCOAL = "#262a30";
const BAND = "#3a4048";
const ACCENT = "#1f3a5f";
const CABLE = "#4a5058";
const DECK_SILVER = "#8b8f98";

export const TOWER_X = 5.2;
export const TOWER_HEIGHT = 9.5;
export const DECK_HALF_HEIGHT = 0.3;
export const DECK_Y = 0;

const TOP_Y = TOWER_HEIGHT / 2 - 0.15;
const SAG_Y = DECK_Y + DECK_HALF_HEIGHT + 0.9;
const ANCHOR_X = TOWER_X + 2.2;
const ANCHOR_Y = -TOWER_HEIGHT / 2 + 0.5;

// Parabolic approximation of the main cable's height between the towers —
// used both to build the curve and to place suspenders precisely on it.
function cableY(x: number) {
  const t = x / TOWER_X;
  return SAG_Y + (TOP_Y - SAG_Y) * t * t;
}

function Tower({ x }: { x: number }) {
  const inner = x < 0 ? 0.62 : -0.62;
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[1.2, TOWER_HEIGHT, 1.5]} radius={0.16} smoothness={5}>
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.4} metalness={0.4} clearcoat={0.4} clearcoatRoughness={0.4} envMapIntensity={1} />
      </RoundedBox>
      {/* Golden-Gate-style crossbeam bands — the detail that reads "tower". */}
      {[TOP_Y - 2.0, TOP_Y - 4.4, TOP_Y - 6.8].map((y, i) => (
        <RoundedBox key={i} args={[1.34, 0.28, 1.64]} radius={0.06} smoothness={3} position={[0, y, 0]}>
          <meshPhysicalMaterial color={BAND} roughness={0.42} metalness={0.45} clearcoat={0.35} />
        </RoundedBox>
      ))}
      <mesh position={[inner, 0, 0.76]}>
        <boxGeometry args={[0.03, TOWER_HEIGHT * 0.94, 0.04]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function MainCable({ z }: { z: number }) {
  const geo = useMemo(() => {
    const pts = [
      new Vector3(-ANCHOR_X, ANCHOR_Y, z),
      new Vector3(-TOWER_X, TOP_Y, z),
      new Vector3(-TOWER_X * 0.5, cableY(-TOWER_X * 0.5), z),
      new Vector3(0, SAG_Y, z),
      new Vector3(TOWER_X * 0.5, cableY(TOWER_X * 0.5), z),
      new Vector3(TOWER_X, TOP_Y, z),
      new Vector3(ANCHOR_X, ANCHOR_Y, z),
    ];
    const curve = new CatmullRomCurve3(pts, false, "catmullrom", 0.2);
    return new TubeGeometry(curve, 64, 0.045, 8, false);
  }, [z]);
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color={CABLE} roughness={0.35} metalness={0.65} clearcoat={0.4} />
    </mesh>
  );
}

function Suspenders({ z }: { z: number }) {
  const xs = [-4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5];
  return (
    <>
      {xs.map((x) => {
        const topY = cableY(x);
        const bottomY = DECK_Y + DECK_HALF_HEIGHT;
        const len = topY - bottomY;
        return (
          <mesh key={x} position={[x, bottomY + len / 2, z]}>
            <cylinderGeometry args={[0.018, 0.018, len, 6]} />
            <meshStandardMaterial color={CABLE} roughness={0.5} metalness={0.5} />
          </mesh>
        );
      })}
    </>
  );
}

const HBridge = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref}>
      <Tower x={-TOWER_X} />
      <Tower x={TOWER_X} />

      <MainCable z={1.3} />
      <MainCable z={-1.3} />
      <Suspenders z={1.3} />
      <Suspenders z={-1.3} />

      {/* the crossbar = the roadway, a silver deck distinct from the towers */}
      <RoundedBox args={[TOWER_X * 2 + 0.3, DECK_HALF_HEIGHT * 2, 3.0]} radius={0.1} smoothness={4} position={[0, DECK_Y, 0]}>
        <meshPhysicalMaterial color={DECK_SILVER} roughness={0.34} metalness={0.55} clearcoat={0.55} clearcoatRoughness={0.3} envMapIntensity={1.2} />
      </RoundedBox>
      <mesh position={[0, DECK_Y + DECK_HALF_HEIGHT, 1.42]}>
        <boxGeometry args={[TOWER_X * 2, 0.05, 0.07]} />
        <meshStandardMaterial color={BAND} />
      </mesh>
      <mesh position={[0, DECK_Y + DECK_HALF_HEIGHT, -1.42]}>
        <boxGeometry args={[TOWER_X * 2, 0.05, 0.07]} />
        <meshStandardMaterial color={BAND} />
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
