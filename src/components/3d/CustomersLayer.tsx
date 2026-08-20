import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { getLiveCustomers, MAX_CUSTOMERS } from '../../systems/customerSimulation'
import { CustomerNPC } from './CustomerNPC'

const ACCENT_PALETTE = ['#5b8fc7', '#c76b5b', '#5bc78f', '#c7a75b', '#8f5bc7', '#c75ba7', '#5bb0c7', '#a7c75b']

function accentColorForId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length]
}

/** Renders a fixed pool of customer meshes and imperatively repositions them
 * from the live simulation state each frame — no per-customer React state,
 * so a busy store doesn't cause a re-render storm. Slot assignment is kept
 * stable per customer id so despawning one customer doesn't make another
 * jump to its old slot's transform. Because slots ARE reused across
 * different customers over a session, each customer's shirt color and
 * basket are driven imperatively too (color set once when a slot changes
 * hands, basket visibility toggled from their live cart every frame). */
export function CustomersLayer() {
  const groupRefs = useRef<(Group | null)[]>([])
  const accentRefs = useRef<(Mesh | null)[]>([])
  const basketRefs = useRef<(Mesh | null)[]>([])
  const slotOf = useRef(new Map<string, number>())
  const freeSlots = useRef(Array.from({ length: MAX_CUSTOMERS }, (_, i) => i))
  const slotOwner = useRef<(string | null)[]>(new Array(MAX_CUSTOMERS).fill(null))

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

      if (slotOwner.current[slot] !== customer.id) {
        slotOwner.current[slot] = customer.id
        const accentMesh = accentRefs.current[slot]
        const material = accentMesh?.material as MeshStandardMaterial | undefined
        if (material) material.color.set(accentColorForId(customer.id))
      }

      const basketMesh = basketRefs.current[slot]
      if (basketMesh) basketMesh.visible = customer.cart.length > 0

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
          <CustomerNPC
            accentRef={(el) => {
              accentRefs.current[i] = el
            }}
            basketRef={(el) => {
              basketRefs.current[i] = el
            }}
          />
        </group>
      ))}
    </group>
  )
}
