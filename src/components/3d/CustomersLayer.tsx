import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { getLiveCustomers, MAX_CUSTOMERS } from '../../systems/customerSimulation'
import { CustomerNPC } from './CustomerNPC'

/** Renders a fixed pool of customer meshes and imperatively repositions them
 * from the live simulation state each frame — no per-customer React state,
 * so a busy store doesn't cause a re-render storm. Slot assignment is kept
 * stable per customer id so despawning one customer doesn't make another
 * jump to its old slot's transform. */
export function CustomersLayer() {
  const groupRefs = useRef<(Group | null)[]>([])
  const slotOf = useRef(new Map<string, number>())
  const freeSlots = useRef(Array.from({ length: MAX_CUSTOMERS }, (_, i) => i))

  useFrame(() => {
    const live = getLiveCustomers()
    const liveIds = new Set(live.map((c) => c.id))

    for (const [id, slot] of slotOf.current) {
      if (!liveIds.has(id)) {
        slotOf.current.delete(id)
        freeSlots.current.push(slot)
        const mesh = groupRefs.current[slot]
        if (mesh) mesh.visible = false
      }
    }

    for (const customer of live) {
      let slot = slotOf.current.get(customer.id)
      if (slot === undefined) {
        slot = freeSlots.current.pop()
        if (slot === undefined) continue
        slotOf.current.set(customer.id, slot)
      }
      const mesh = groupRefs.current[slot]
      if (!mesh) continue
      mesh.visible = true
      mesh.position.set(customer.position.x, customer.position.y, customer.position.z)
      mesh.rotation.y = customer.rotationY
    }
  })

  return (
    <group>
      {Array.from({ length: MAX_CUSTOMERS }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
          visible={false}
        >
          <CustomerNPC />
        </group>
      ))}
    </group>
  )
}
