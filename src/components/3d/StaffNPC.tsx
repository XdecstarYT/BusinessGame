import { STAFF_ROLES, type StaffRole } from '../../data/staffDefinitions'
import { HumanoidBody } from './HumanoidBody'

interface StaffNPCProps {
  role: StaffRole
}

/** Staff character on the shared HumanoidBody rig, colored by role so they
 * read as distinct from shoppers and from each other at a glance. */
export function StaffNPC({ role }: StaffNPCProps) {
  const color = STAFF_ROLES[role].color

  return (
    <group>
      <HumanoidBody shirtColor={color} pantsColor="#23262e" />
    </group>
  )
}
