// Pure grid math — no React/Three imports, unit-testable in isolation.

export const CELL_SIZE = 1
export const GRID_WIDTH = 24
export const GRID_DEPTH = 24
export const WALL_HEIGHT = 3
export const WALL_THICKNESS = 0.15
/** Vertical spacing between building levels — a level's walls exactly meet the floor above. */
export const LEVEL_HEIGHT = WALL_HEIGHT

export type WallOrientation = 'N' | 'W'

export interface Cell {
  x: number
  z: number
}

export function worldToCell(worldX: number, worldZ: number): Cell {
  return { x: Math.floor(worldX / CELL_SIZE), z: Math.floor(worldZ / CELL_SIZE) }
}

export function cellCenterToWorld(cell: Cell): [number, number] {
  return [cell.x * CELL_SIZE + CELL_SIZE / 2, cell.z * CELL_SIZE + CELL_SIZE / 2]
}

export function cellKey(cell: Cell): string {
  return `${cell.x},${cell.z}`
}

export function isWithinBounds(cell: Cell): boolean {
  return cell.x >= 0 && cell.x < GRID_WIDTH && cell.z >= 0 && cell.z < GRID_DEPTH
}

/** Identifies the edge (wall slot) nearest a world-space point within a cell.
 * 'N' = north edge of the cell (shared with the cell's -Z neighbor)
 * 'W' = west edge of the cell (shared with the cell's -X neighbor)
 * Using only N/W per cell means every wall in the grid has exactly one canonical key. */
export function worldToNearestEdge(worldX: number, worldZ: number): { cell: Cell; orientation: WallOrientation } {
  const cell = worldToCell(worldX, worldZ)
  const fracX = worldX / CELL_SIZE - cell.x
  const fracZ = worldZ / CELL_SIZE - cell.z

  // distance to each of the 4 edges of this cell, in fractional cell units
  const distN = fracZ
  const distS = 1 - fracZ
  const distW = fracX
  const distE = 1 - fracX

  const min = Math.min(distN, distS, distW, distE)

  if (min === distN) return { cell, orientation: 'N' }
  if (min === distS) return { cell: { x: cell.x, z: cell.z + 1 }, orientation: 'N' }
  if (min === distW) return { cell, orientation: 'W' }
  return { cell: { x: cell.x + 1, z: cell.z }, orientation: 'W' }
}

export function edgeKey(cell: Cell, orientation: WallOrientation): string {
  return `${cell.x},${cell.z},${orientation}`
}

/** World-space center + rotation (radians about Y) for a wall segment. */
export function edgeToWorld(cell: Cell, orientation: WallOrientation): { position: [number, number, number]; rotationY: number } {
  const [cx, cz] = cellCenterToWorld(cell)
  if (orientation === 'N') {
    return { position: [cx, WALL_HEIGHT / 2, cz - CELL_SIZE / 2], rotationY: 0 }
  }
  return { position: [cx - CELL_SIZE / 2, WALL_HEIGHT / 2, cz], rotationY: Math.PI / 2 }
}

export function isEdgeWithinBounds(cell: Cell, orientation: WallOrientation): boolean {
  if (orientation === 'N') {
    return cell.x >= 0 && cell.x < GRID_WIDTH && cell.z >= 0 && cell.z <= GRID_DEPTH
  }
  return cell.x >= 0 && cell.x <= GRID_WIDTH && cell.z >= 0 && cell.z < GRID_DEPTH
}

export const ROTATION_STEPS = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]

export function nextRotation(current: number): number {
  const idx = ROTATION_STEPS.findIndex((r) => Math.abs(r - current) < 0.001)
  return ROTATION_STEPS[(idx + 1) % ROTATION_STEPS.length]
}
