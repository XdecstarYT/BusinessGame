import type { Mesh } from 'three'
import { Html } from '@react-three/drei'
import { HumanoidBody } from './HumanoidBody'

interface CustomerNPCProps {
  accentRef?: (mesh: Mesh | null) => void
  basketRef?: (mesh: Mesh | null) => void
  personaRef?: (el: HTMLDivElement | null) => void
}

/** Shopper NPC built on the shared HumanoidBody rig (legs/torso/arms/head)
 * instead of a single capsule. The shirt, basket, and persona icon are
 * exposed via refs so CustomersLayer can update them imperatively per pool
 * slot — Html tracks this group's world transform every frame on its own,
 * so it follows the imperative position updates without any React state. */
export function CustomerNPC({ accentRef, basketRef, personaRef }: CustomerNPCProps) {
  return (
    <group>
      <HumanoidBody shirtColor="#5b8fc7" shirtRef={accentRef} />
      <mesh ref={basketRef} position={[0.3, 0.32, 0.14]} visible={false} castShadow>
        <boxGeometry args={[0.16, 0.13, 0.12]} />
        <meshStandardMaterial color="#7a5230" roughness={0.8} />
      </mesh>
      <Html position={[0, 1.5, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div ref={personaRef} style={{ fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))', display: 'none' }} />
      </Html>
    </group>
  )
}
