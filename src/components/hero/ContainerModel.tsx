import { RoundedBox } from "@react-three/drei";
import { forwardRef } from "react";
import type { Group } from "three";

// A 3D take on Apple's `container` icon: a rounded-square slab with a lighter
// inset face carrying three stacked pill rows, each with a node dot on the
// right. Cool lavender-grey, so it reads instantly as an Apple container.
// The parent animates the outer group (drift / dock / disperse).

const BODY = "#7c80a4";
const FACE = "#c7c9db";
const PILL = "#a9adca";
const NODE = "#f3f4fb";

const ROWS = [0.42, 0, -0.42];

const ContainerModel = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref}>
      {/* body slab */}
      <RoundedBox args={[1.5, 1.5, 0.62]} radius={0.22} smoothness={6}>
        <meshPhysicalMaterial
          color={BODY}
          roughness={0.38}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          envMapIntensity={1.1}
        />
      </RoundedBox>

      {/* lighter inset face plate */}
      <RoundedBox args={[1.28, 1.28, 0.04]} radius={0.16} smoothness={5} position={[0, 0, 0.31]}>
        <meshPhysicalMaterial
          color={FACE}
          roughness={0.32}
          metalness={0.05}
          clearcoat={0.5}
          clearcoatRoughness={0.28}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* three pill rows + node dots — the engraving */}
      {ROWS.map((y, i) => (
        <group key={i} position={[0, y, 0.34]}>
          <RoundedBox args={[0.92, 0.24, 0.06]} radius={0.12} smoothness={4} position={[-0.06, 0, 0]}>
            <meshPhysicalMaterial color={PILL} roughness={0.4} metalness={0.05} clearcoat={0.4} envMapIntensity={1} />
          </RoundedBox>
          <mesh position={[0.3, 0, 0.04]}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshPhysicalMaterial color={NODE} roughness={0.25} metalness={0.0} clearcoat={0.6} envMapIntensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

ContainerModel.displayName = "ContainerModel";
export default ContainerModel;
