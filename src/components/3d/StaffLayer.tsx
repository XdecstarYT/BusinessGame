import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useStaff } from '../../stores/useStaff'
import { getLiveStaff } from '../../systems/staffSimulation'
import { StaffNPC } from './StaffNPC'

/** Staff are few and long-lived (unlike the fast-churning customer pool), so
 * they're keyed directly by roster id — React handles mount/unmount on
 * hire/fire, and a single useFrame here pushes live position/visibility
 * into each one's ref every frame without going through React state. */
export function StaffLayer() {
  const roster = useStaff((s) => s.roster)
  const groupRefs = useRef(new Map<string, Group>())

  useFrame(() => {
    for (const npc of getLiveStaff()) {
      const group = groupRefs.current.get(npc.id)
      if (!group) continue
      if (!npc.onDuty) {
        group.visible = false
        continue
      }
      group.visible = true
      group.position.set(npc.position.x, npc.position.y, npc.position.z)
      group.rotation.y = npc.rotationY
    }
  })

  return (
    <group>
      {Object.values(roster).map((member) => (
        <group
          key={member.id}
          ref={(el) => {
            if (el) groupRefs.current.set(member.id, el)
            else groupRefs.current.delete(member.id)
          }}
          visible={false}
        >
          <StaffNPC role={member.role} />
        </group>
      ))}
    </group>
  )
}
