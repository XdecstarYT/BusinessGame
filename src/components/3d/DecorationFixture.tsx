interface DecorationFixtureProps {
  height: number
}

/** A simple procedural potted plant — purely cosmetic, boosts atmosphere
 * (see useStoreAtmosphere's decor bonus) but isn't shoppable and has no
 * inventory of its own. */
export function DecorationFixture({ height }: DecorationFixtureProps) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.36, 12]} />
        <meshStandardMaterial color="#8a5a3f" roughness={0.85} />
      </mesh>
      <mesh position={[0, height * 0.55, 0]} castShadow>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial color="#3f8a4f" roughness={0.8} />
      </mesh>
      <mesh position={[0.16, height * 0.72, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#4a9f5a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.14, height * 0.68, -0.12]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#357a44" roughness={0.8} />
      </mesh>
    </group>
  )
}
