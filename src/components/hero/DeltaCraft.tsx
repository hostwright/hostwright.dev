import { forwardRef, useMemo } from "react";
import { CapsuleGeometry, ExtrudeGeometry, Shape, type Group } from "three";

// A real aircraft silhouette, not an abstract wedge: a slender fuselage, swept
// delta wings, a tail fin, and a glass canopy. Light and quick — the "not a
// jetski" answer to Kubernetes' heavy ship, built from the same clean
// geometric primitives as everything else on the site.

const BODY = "#23262b";
const DARK = "#14161a";
const GLASS = "#0f1a26";
const ACCENT = "#1f3a5f";

function useWingGeometry() {
  return useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.lineTo(1.9, -1.05);
    s.quadraticCurveTo(1.1, -1.2, 0.3, -0.55);
    s.lineTo(0, 0);
    const geo = new ExtrudeGeometry(s, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);
}

function useTailGeometry() {
  return useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.lineTo(-0.5, 0.62);
    s.lineTo(-0.16, 0.62);
    s.lineTo(0.14, 0);
    s.lineTo(0, 0);
    const geo = new ExtrudeGeometry(s, {
      depth: 0.045,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);
}

const DeltaCraft = forwardRef<Group>((_, ref) => {
  const wing = useWingGeometry();
  const tail = useTailGeometry();
  const fuselage = useMemo(() => {
    const g = new CapsuleGeometry(0.17, 1.5, 6, 14);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);

  return (
    <group ref={ref}>
      {/* fuselage: nose points +X */}
      <mesh geometry={fuselage} castShadow>
        <meshPhysicalMaterial color={BODY} roughness={0.3} metalness={0.4} clearcoat={0.75} clearcoatRoughness={0.25} envMapIntensity={1.4} />
      </mesh>

      {/* nose taper cap for a sharper point than the capsule alone gives */}
      <mesh position={[1.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.17, 0.4, 14]} />
        <meshPhysicalMaterial color={BODY} roughness={0.3} metalness={0.4} clearcoat={0.75} clearcoatRoughness={0.25} envMapIntensity={1.4} />
      </mesh>

      {/* canopy */}
      <mesh position={[0.35, 0.16, 0]} scale={[1, 0.5, 0.42]}>
        <sphereGeometry args={[0.24, 20, 16]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.1} metalness={0.15} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.7} />
      </mesh>

      {/* delta wings, mirrored, swept back from mid-fuselage */}
      <mesh geometry={wing} position={[-0.15, -0.02, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color={BODY} roughness={0.32} metalness={0.35} clearcoat={0.6} clearcoatRoughness={0.3} envMapIntensity={1.2} />
      </mesh>
      <mesh geometry={wing} position={[-0.15, -0.02, -0.16]} rotation={[Math.PI / 2, 0, Math.PI]}>
        <meshPhysicalMaterial color={BODY} roughness={0.32} metalness={0.35} clearcoat={0.6} clearcoatRoughness={0.3} envMapIntensity={1.2} />
      </mesh>

      {/* vertical tail fin */}
      <mesh geometry={tail} position={[-0.78, 0.15, 0]} rotation={[0, 0, 0]}>
        <meshPhysicalMaterial color={DARK} roughness={0.4} metalness={0.3} clearcoat={0.5} />
      </mesh>

      {/* a thin accent line along the spine — the seam, carried onto the craft */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[1.3, 0.02, 0.02]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
});

DeltaCraft.displayName = "DeltaCraft";
export default DeltaCraft;
