// Static geometry data for the City Map scene's exterior: the road grid,
// pedestrian sidewalk loops, traffic routes, and where the supply-chain's
// warehouses/factories physically sit. Pure data — no React/Three imports —
// so it can be reused by roads, traffic, pedestrian, and delivery-truck
// layers without any of them depending on each other.
import { NEIGHBORHOODS } from './neighborhoods'
import { SUPPLIERS } from './suppliers'

export type Point = [number, number]

export interface RoadSegment {
  from: Point
  to: Point
}

/** Road centerlines (world x/z). A cross-grid through the plot rows/columns,
 * a perimeter ring, and a spur running south to the industrial district. */
export const ROAD_SEGMENTS: RoadSegment[] = [
  { from: [-13, -70], to: [-13, 36] },
  { from: [13, -70], to: [13, 36] },
  { from: [-36, -13], to: [36, -13] },
  { from: [-36, 13], to: [36, 13] },
  { from: [-36, -36], to: [36, -36] },
  { from: [-36, 36], to: [36, 36] },
  { from: [-36, -36], to: [-36, 36] },
  { from: [36, -36], to: [36, 36] },
  { from: [-30, -55], to: [30, -55] },
]

export const ROAD_WIDTH = 4.6
export const SIDEWALK_WIDTH = 1.5

/** Closed-loop waypoints traffic drives around, in the same coordinate
 * space as ROAD_SEGMENTS (loops back from the last point to the first). */
export const CAR_ROUTES: Point[][] = [
  [
    [-13, -13],
    [13, -13],
    [13, 13],
    [-13, 13],
  ],
  [
    [-36, -36],
    [36, -36],
    [36, 36],
    [-36, 36],
  ],
  [
    [13, -36],
    [13, -55],
    [-13, -55],
    [-13, -36],
  ],
]

/** One walking loop around each plot's block, offset out past the building
 * footprint (half-size 6) but short of the road (13) so pedestrians read as
 * strolling the sidewalk ring around every store. */
const PEDESTRIAN_RING_RADIUS = 8.5

export const PEDESTRIAN_ROUTES: Point[][] = NEIGHBORHOODS.map((plot) => {
  const [cx, cz] = plot.position
  const r = PEDESTRIAN_RING_RADIUS
  return [
    [cx - r, cz - r],
    [cx + r, cz - r],
    [cx + r, cz + r],
    [cx - r, cz + r],
  ] as Point[]
})

export type IndustrialBuildingKind = 'warehouse' | 'factory'

export interface IndustrialBuildingPlacement {
  supplierId: string
  kind: IndustrialBuildingKind
  position: Point
}

/** Every supplier gets a physical building in the industrial district south
 * of the main plot grid — two rows of three, alternating warehouse/factory
 * silhouettes so the district reads as a mixed logistics park. */
export const INDUSTRIAL_DISTRICT: IndustrialBuildingPlacement[] = SUPPLIERS.map((supplier, i) => {
  const col = i % 3
  const row = Math.floor(i / 3)
  return {
    supplierId: supplier.id,
    kind: i % 2 === 0 ? 'warehouse' : 'factory',
    position: [-20 + col * 20, -63 - row * 15] as Point,
  }
})

export function industrialBuildingForSupplier(supplierId: string): IndustrialBuildingPlacement | undefined {
  return INDUSTRIAL_DISTRICT.find((b) => b.supplierId === supplierId)
}
