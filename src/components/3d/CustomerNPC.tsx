import type { Mesh } from 'three'
import { Html } from '@react-three/drei'

interface CustomerNPCProps {
  accentRef?: (mesh: Mesh | null) => void
  basketRef?: (mesh: Mesh | null) => void
  personaRef?: (el: HTMLDivElement | null) => void
}

/** Placeholder shopper: a capsule body + head, matching the box/plane
 * fidelity bar the rest of Phase 1/2 uses. Real character models are a
 * later-phase asset pass. The shirt accent, basket, and persona icon are
 * exposed via refs so CustomersLayer can update them imperatively per pool
 * slot — Html tracks this group's world transform every frame on its own,
 * so it follows the imperative position updates without any React state. */
export function CustomerNPC({ accentRef, basketRef, personaRef }: CustomerNPCProps) {
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
      <Html position={[0, 1.45, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div ref={personaRef} style={{ fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))', display: 'none' }} />
      </Html>
    </group>
  )
}
