import { Html } from '@react-three/drei'

interface FactoryBuildingProps {
  color: string
  label: string
}

/** A production factory: a boxy plant with a pair of smokestacks and a row
 * of storage silos alongside — visually distinct from the flatter
 * warehouse silhouette. */
export function FactoryBuilding({ color, label }: FactoryBuildingProps) {
  return (
    <group>
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[11, 7, 9]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {[-2.4, 2.4].map((x, i) => (
        <mesh key={i} position={[x, 9.2, -2]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 4.8, 10]} />
          <meshStandardMaterial color="#4a4f58" roughness={0.7} />
        </mesh>
      ))}
      {[-2.4, 2.4].map((x, i) => (
        <mesh key={`cap-${i}`} position={[x, 11.7, -2]}>
          <cylinderGeometry args={[0.7, 0.55, 0.3, 10]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.6} />
        </mesh>
      ))}

      {[-6.5, -4.4].map((x, i) => (
        <mesh key={i} position={[x, 3.2, 6]} castShadow>
          <cylinderGeometry args={[1.1, 1.1, 6.4, 14]} />
          <meshStandardMaterial color="#c7cbd1" roughness={0.5} metalness={0.15} />
        </mesh>
      ))}
      {[-6.5, -4.4].map((x, i) => (
        <mesh key={`silo-cap-${i}`} position={[x, 6.6, 6]}>
          <coneGeometry args={[1.15, 0.9, 14]} />
          <meshStandardMaterial color="#9ba0a8" roughness={0.5} />
        </mesh>
      ))}

      <Html position={[0, 8.3, 0]} center distanceFactor={26} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap text-[11px] font-semibold text-white bg-black/70 rounded-full px-2.5 py-0.5 shadow">{label}</div>
      </Html>
    </group>
  )
}
