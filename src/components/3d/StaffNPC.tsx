import { STAFF_ROLES, type StaffRole } from '../../data/staffDefinitions'

interface StaffNPCProps {
  role: StaffRole
}

/** Placeholder staff character — same silhouette as CustomerNPC, colored by
 * role (and a small vest accent) so they read as distinct at a glance. */
export function StaffNPC({ role }: StaffNPCProps) {
  const color = STAFF_ROLES[role].color

  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 4, 8]} />
        <meshStandardMaterial color="#3a3f4a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.32, 0.4, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#e8c39e" roughness={0.6} />
      </mesh>
    </group>
  )
}
