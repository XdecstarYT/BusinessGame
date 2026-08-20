import { Detailed } from '@react-three/drei'

/**
 * Phase 1 de-risking spike (per spec): proves the distance-based LOD swap
 * mechanism works in-engine before it's relied on for hundreds of NPCs/products
 * in later phases. High-poly "hero" proxy swaps to a low-poly box past ~8m,
 * and disappears past ~25m.
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
        <Detailed key={i} distances={[0, 8, 25]} position={[x, 0.5, z]}>
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
      ))}
    </group>
  )
}
