/** Placeholder shopper: a capsule body + head, matching the box/plane
 * fidelity bar the rest of Phase 1/2 uses. Real character models are a
 * later-phase asset pass. */
export function CustomerNPC() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 4, 8]} />
        <meshStandardMaterial color="#5b8fc7" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#e8c39e" roughness={0.6} />
      </mesh>
    </group>
  )
}
