import type { Mesh } from 'three'

interface CustomerNPCProps {
  accentRef?: (mesh: Mesh | null) => void
  basketRef?: (mesh: Mesh | null) => void
}

/** Placeholder shopper: a capsule body + head, matching the box/plane
 * fidelity bar the rest of Phase 1/2 uses. Real character models are a
 * later-phase asset pass. The shirt accent and basket are exposed via refs
 * so CustomersLayer can recolor/toggle them imperatively per pool slot. */
export function CustomerNPC({ accentRef, basketRef }: CustomerNPCProps) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 4, 8]} />
        <meshStandardMaterial color="#7d8590" roughness={0.7} />
      </mesh>
      <mesh ref={accentRef} position={[0, 0.62, 0.2]} castShadow>
        <boxGeometry args={[0.3, 0.24, 0.05]} />
        <meshStandardMaterial color="#5b8fc7" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#e8c39e" roughness={0.6} />
      </mesh>
      <mesh ref={basketRef} position={[0.24, 0.32, 0.1]} visible={false} castShadow>
        <boxGeometry args={[0.16, 0.13, 0.12]} />
        <meshStandardMaterial color="#7a5230" roughness={0.8} />
      </mesh>
    </group>
  )
}
