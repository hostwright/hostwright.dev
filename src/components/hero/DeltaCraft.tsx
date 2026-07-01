import { forwardRef, useMemo } from "react";
import { ExtrudeGeometry, Shape, type Group } from "three";

// A sleek delta flying-wing (A-12 planform, minus the war-machine tone): a flat
// charcoal triangle, swept and rounded, light and fast — the "quick, reliable"
// counterpart to Kubernetes' heavy ship. Built from an extruded 2D triangle so
// it stays in the same clean geometric language as everything else.

const CHARCOAL = "#23262b";
const DARK = "#14161a";
const GLASS = "#0f1a26";

function useWingGeometry() {
  return useMemo(() => {
    const s = new Shape();
    // nose forward (+y in shape space), wide swept trailing edge behind
    s.moveTo(0, 3.0); // nose tip
    s.lineTo(2.7, -2.0); // right trailing corner
    s.quadraticCurveTo(1.4, -1.4, 0, -1.5); // curved trailing edge, centre notch
    s.quadraticCurveTo(-1.4, -1.4, -2.7, -2.0); // to left trailing corner
    s.lineTo(0, 3.0);
    const geo = new ExtrudeGeometry(s, {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.16,
      bevelSize: 0.18,
      bevelSegments: 5,
      steps: 1,
    });
    geo.center();
    // lay it flat: triangle in XZ plane, thin in Y, nose toward +X
    geo.rotateX(-Math.PI / 2);
    geo.rotateY(-Math.PI / 2);
    return geo;
  }, []);
}

const DeltaCraft = forwardRef<Group>((_, ref) => {
  const wing = useWingGeometry();
  return (
    <group ref={ref}>
      {/* the wing body */}
      <mesh geometry={wing} castShadow>
        <meshPhysicalMaterial
          color={CHARCOAL}
          roughness={0.34}
          metalness={0.35}
          clearcoat={0.7}
          clearcoatRoughness={0.28}
          envMapIntensity={1.3}
        />
      </mesh>
      {/* cockpit canopy — a low glassy blister near the nose */}
      <mesh position={[1.5, 0.24, 0]} scale={[1.1, 0.42, 0.6]}>
        <sphereGeometry args={[0.5, 24, 20]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.1} metalness={0.2} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.7} />
      </mesh>
      {/* twin dorsal spine lines — subtle stealth facets */}
      <mesh position={[-0.2, 0.19, 0.55]} rotation={[0, -0.32, 0]}>
        <boxGeometry args={[3.6, 0.04, 0.05]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[-0.2, 0.19, -0.55]} rotation={[0, 0.32, 0]}>
        <boxGeometry args={[3.6, 0.04, 0.05]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
    </group>
  );
});

DeltaCraft.displayName = "DeltaCraft";
export default DeltaCraft;
