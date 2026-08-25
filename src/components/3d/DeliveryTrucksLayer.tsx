import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { DELIVERY_TRUCK_POOL_SIZE, getDeliveryTruckPoses, tickDeliveryTrucks } from '../../systems/deliveryTruckSim'
import { TruckMesh } from './TruckMesh'

const POOL_COLORS = ['#3b6fc2', '#c23b3b', '#3aa66b', '#e8b93e', '#8a4fc2', '#e0654f']

/** Renders whatever delivery trucks are currently in transit (spawned by
 * useSupplyChain on a successful order) — same fixed-pool + imperative-
 * update pattern as CustomersLayer, since trucks come and go dynamically. */
export function DeliveryTrucksLayer() {
  const groupRefs = useRef<(Group | null)[]>([])
  const slotOf = useRef(new Map<number, number>())
  const freeSlots = useRef(Array.from({ length: DELIVERY_TRUCK_POOL_SIZE }, (_, i) => i))

  useFrame((_, delta) => {
    tickDeliveryTrucks(delta)
    const poses = getDeliveryTruckPoses()
    const liveIds = new Set(poses.map((p) => p.id))

    for (const [id, slot] of slotOf.current) {
      if (!liveIds.has(id)) {
        slotOf.current.delete(id)
        freeSlots.current.push(slot)
        const group = groupRefs.current[slot]
        if (group) group.visible = false
      }
    }

    for (const pose of poses) {
      let slot = slotOf.current.get(pose.id)
      if (slot === undefined) {
        slot = freeSlots.current.pop()
        if (slot === undefined) continue
        slotOf.current.set(pose.id, slot)
      }
      const group = groupRefs.current[slot]
      if (!group) continue
      group.visible = true
      group.position.set(pose.x, 0, pose.z)
      group.rotation.y = pose.heading
    }
  })

  return (
    <group>
      {Array.from({ length: DELIVERY_TRUCK_POOL_SIZE }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
          visible={false}
        >
          <TruckMesh color={POOL_COLORS[i % POOL_COLORS.length]} />
        </group>
      ))}
    </group>
  )
}
