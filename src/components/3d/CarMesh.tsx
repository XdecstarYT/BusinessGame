interface CarMeshProps {
  color: string
}

const WHEEL_POSITIONS: [number, number, number][] = [
  [0.55, 0.24, 0.62],
  [-0.55, 0.24, 0.62],
  [0.55, 0.24, -0.62],
  [-0.55, 0.24, -0.62],
]

/** Low-poly car: a body box, a cabin box riding on top for a wagon/hatchback
 * silhouette, four wheel cylinders, and small emissive head/tail lights.
 * Faces +X — CityTraffic rotates the whole thing to match travel direction. */
export function CarMesh({ color }: CarMeshProps) {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.9, 0.42, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[-0.1, 0.72, 0]} castShadow>
        <boxGeometry args={[1.05, 0.36, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[-0.1, 0.72, 0]}>
        <boxGeometry args={[1.1, 0.24, 0.9]} />
        <meshStandardMaterial color="#1a1e26" roughness={0.15} metalness={0.1} transparent opacity={0.75} />
      </mesh>

      {WHEEL_POSITIONS.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.2, 12]} />
          <meshStandardMaterial color="#15161a" roughness={0.8} />
        </mesh>
      ))}

      <mesh position={[0.96, 0.42, 0.32]}>
        <boxGeometry args={[0.06, 0.14, 0.16]} />
        <meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0.96, 0.42, -0.32]}>
        <boxGeometry args={[0.06, 0.14, 0.16]} />
        <meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[-0.96, 0.42, 0.32]}>
        <boxGeometry args={[0.06, 0.14, 0.16]} />
        <meshStandardMaterial color="#c0121f" emissive="#c0121f" emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[-0.96, 0.42, -0.32]}>
        <boxGeometry args={[0.06, 0.14, 0.16]} />
        <meshStandardMaterial color="#c0121f" emissive="#c0121f" emissiveIntensity={1.1} />
      </mesh>
    </group>
  )
}
