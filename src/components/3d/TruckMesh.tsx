interface TruckMeshProps {
  color: string
}

const WHEEL_POSITIONS: [number, number, number][] = [
  [0.95, 0.32, 0.78],
  [-0.95, 0.32, 0.78],
  [0.95, 0.32, -0.78],
  [-0.95, 0.32, -0.78],
  [-1.7, 0.32, 0.78],
  [-1.7, 0.32, -0.78],
]

/** Delivery truck: a cab box up front and a longer boxy cargo container
 * behind it, riding on six wheels. Faces +X, like CarMesh. */
export function TruckMesh({ color }: TruckMeshProps) {
  return (
    <group>
      <mesh position={[1.35, 0.75, 0]} castShadow>
        <boxGeometry args={[0.9, 0.85, 1.5]} />
        <meshStandardMaterial color="#dfe3e8" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[1.35, 0.95, 0]}>
        <boxGeometry args={[0.75, 0.35, 1.3]} />
        <meshStandardMaterial color="#1a1e26" roughness={0.15} transparent opacity={0.75} />
      </mesh>

      <mesh position={[-0.6, 0.9, 0]} castShadow>
        <boxGeometry args={[3.0, 1.7, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
      </mesh>

      {WHEEL_POSITIONS.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.24, 12]} />
          <meshStandardMaterial color="#15161a" roughness={0.8} />
        </mesh>
      ))}

      <mesh position={[1.8, 0.75, 0.42]}>
        <boxGeometry args={[0.06, 0.16, 0.18]} />
        <meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[1.8, 0.75, -0.42]}>
        <boxGeometry args={[0.06, 0.16, 0.18]} />
        <meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}
