// Impure, module-level — same reasoning as salePops.ts/touchInput.ts: a
// handful of trucks driving across the city map is transient visual flavor,
// not something any Zustand subscriber needs to react to, so it lives
// outside the store to avoid a re-render per truck per frame.
import { industrialBuildingForSupplier, type Point } from '../data/cityLayout'

export interface DeliveryTruck {
  id: number
  waypoints: Point[]
  segLengths: number[]
  total: number
  traveled: number
  speed: number
}

const TRUCK_SPEED = 9
const MAX_TRUCKS = 6
/** Where a truck peels off the road grid to "arrive" at the player's home
 * plot (downtown, at the map origin) — just outside its building footprint. */
const HOME_APPROACH: Point = [8, 0]

let trucks: DeliveryTruck[] = []
let nextId = 1

function buildWaypoints(start: Point): Point[] {
  return [start, [start[0], -55], [13, -55], [13, -13], [13, 0], HOME_APPROACH]
}

function pathLength(waypoints: Point[]): number[] {
  const segLengths: number[] = []
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i]
    const b = waypoints[i + 1]
    segLengths.push(Math.hypot(b[0] - a[0], b[1] - a[1]))
  }
  return segLengths
}

/** Called whenever a supply order is successfully placed — spawns a truck
 * that visibly drives from that supplier's warehouse/factory to the home
 * store on the City Map. Purely cosmetic: it doesn't gate or sync with the
 * day-based arrivalDay in useSupplyChain, it's just flavor that a shipment
 * is on its way. */
export function spawnDeliveryTruck(supplierId: string): void {
  if (trucks.length >= MAX_TRUCKS) return
  const building = industrialBuildingForSupplier(supplierId)
  if (!building) return
  const waypoints = buildWaypoints(building.position)
  const segLengths = pathLength(waypoints)
  trucks.push({
    id: nextId++,
    waypoints,
    segLengths,
    total: segLengths.reduce((a, b) => a + b, 0),
    traveled: 0,
    speed: TRUCK_SPEED,
  })
}

export function tickDeliveryTrucks(delta: number): void {
  if (trucks.length === 0) return
  for (const truck of trucks) truck.traveled += truck.speed * delta
  trucks = trucks.filter((t) => t.traveled < t.total + 1.5)
}

export interface TruckPose {
  id: number
  x: number
  z: number
  heading: number
}

export function getDeliveryTruckPoses(): TruckPose[] {
  return trucks.map((truck) => {
    let remaining = Math.min(truck.traveled, truck.total)
    for (let i = 0; i < truck.waypoints.length - 1; i++) {
      const len = truck.segLengths[i]
      if (remaining <= len || i === truck.waypoints.length - 2) {
        const a = truck.waypoints[i]
        const b = truck.waypoints[i + 1]
        const t = len > 0 ? remaining / len : 0
        return {
          id: truck.id,
          x: a[0] + (b[0] - a[0]) * t,
          z: a[1] + (b[1] - a[1]) * t,
          heading: -Math.atan2(b[1] - a[1], b[0] - a[0]),
        }
      }
      remaining -= len
    }
    const [x, z] = truck.waypoints[truck.waypoints.length - 1]
    return { id: truck.id, x, z, heading: 0 }
  })
}

export const DELIVERY_TRUCK_POOL_SIZE = MAX_TRUCKS
