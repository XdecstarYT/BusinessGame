import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Detailed } from '@react-three/drei'
import type { Group } from 'three'

/**
 * Phase 1 de-risking spike (per spec): proves the distance-based LOD swap
 * mechanism works in-engine before it's relied on for hundreds of NPCs/products
 * in later phases. High-poly "hero" proxy swaps to a low-poly box past ~8m,
 * and disappears past ~25m. Idle rotate/bob keeps the empty store from
 * feeling static while real props/customers aren't in yet (Phase 2+).
 */
export function LODTestProps() {
  const positions: [number, number][] = [
    [-3, 3],
    [-3, 5],
    [-3, 7],
  ]

  return (
    <group>
      {positions.map(([x, z], i) => (
        <IdleProp key={i} position={[x, 0.5, z]} phaseOffset={i * 1.7} />
      ))}
    </group>
  )
}

interface IdlePropProps {
  position: [number, number, number]
  phaseOffset: number
}

function IdleProp({ position, phaseOffset }: IdlePropProps) {
  const ref = useRef<Group>(null)

  useFrame(({ clock }) => {
    const group = ref.current
    if (!group) return
    const t = clock.elapsedTime + phaseOffset
    group.rotation.y = t * 0.6
    group.position.y = position[1] + Math.sin(t * 1.3) * 0.12
  })

  return (
    <group ref={ref} position={position}>
      <Detailed distances={[0, 8, 25]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.5, 3]} />
          <meshStandardMaterial color="#e8a33d" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh castShadow>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#e8a33d" roughness={0.7} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshBasicMaterial color="#e8a33d" />
        </mesh>
      </Detailed>
    </group>
  )
}
