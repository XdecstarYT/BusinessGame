import { Html } from '@react-three/drei'

interface WarehouseBuildingProps {
  color: string
  label: string
}

const DOCK_OFFSETS = [-4.2, 0, 4.2]

/** A distribution warehouse: a long low box with a shallow roof cap and
 * three loading-dock doors along the front face. */
export function WarehouseBuilding({ color, label }: WarehouseBuildingProps) {
  return (
    <group>
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[14, 6, 10]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 6.15, 0]} castShadow>
        <boxGeometry args={[14.6, 0.3, 10.6]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.9} />
      </mesh>

      {DOCK_OFFSETS.map((x, i) => (
        <mesh key={i} position={[x, 1.7, 5.02]} castShadow>
          <boxGeometry args={[2.4, 3.2, 0.08]} />
          <meshStandardMaterial color="#1c1e24" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, 5.05]}>
        <boxGeometry args={[13.4, 0.25, 0.3]} />
        <meshStandardMaterial color="#c94f2e" roughness={0.7} />
      </mesh>

      <Html position={[0, 7.3, 0]} center distanceFactor={26} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap text-[11px] font-semibold text-white bg-black/70 rounded-full px-2.5 py-0.5 shadow">{label}</div>
      </Html>
    </group>
  )
}
