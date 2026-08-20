// Pure — no React/Three imports, unit-testable in isolation.
import { cellKey, edgeKey, type Cell, type WallOrientation } from './grid'

export interface WallSegment {
  cell: Cell
  orientation: WallOrientation
}

interface PathfindingContext {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
}

const DIRECTIONS: Array<{ dx: number; dz: number }> = [
  { dx: 0, dz: -1 },
  { dx: 0, dz: 1 },
  { dx: -1, dz: 0 },
  { dx: 1, dz: 0 },
]

function isBlocked(a: Cell, b: Cell, walls: Record<string, WallSegment>): boolean {
  const dx = b.x - a.x
  const dz = b.z - a.z
  if (dz === -1) return edgeKey(a, 'N') in walls
  if (dz === 1) return edgeKey(b, 'N') in walls
  if (dx === -1) return edgeKey(a, 'W') in walls
  if (dx === 1) return edgeKey(b, 'W') in walls
  return true
}

function heuristic(a: Cell, b: Cell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z)
}

/** Grid-based A* over floor cells, blocked by placed walls. Returns the cell
 * path including start and goal, or null if no walkable route exists. The
 * grid is small (tens of cells) and searches are infrequent (once per
 * customer per shopping decision), so a linear open-set scan is plenty. */
export function findPath(start: Cell, goal: Cell, ctx: PathfindingContext): Cell[] | null {
  const startKey = cellKey(start)
  const goalKey = cellKey(goal)
  if (!(startKey in ctx.floors) || !(goalKey in ctx.floors)) return null
  if (startKey === goalKey) return [start]

  const open = new Map<string, Cell>([[startKey, start]])
  const cameFrom = new Map<string, string>()
  const gScore = new Map<string, number>([[startKey, 0]])
  const fScore = new Map<string, number>([[startKey, heuristic(start, goal)]])
  const closed = new Set<string>()

  while (open.size > 0) {
    let currentKey: string | null = null
    let currentF = Infinity
    for (const [key, f] of fScoreEntries(open, fScore)) {
      if (f < currentF) {
        currentF = f
        currentKey = key
      }
    }
    if (!currentKey) break

    const current = open.get(currentKey)!
    if (currentKey === goalKey) return reconstructPath(cameFrom, currentKey, ctx.floors)

    open.delete(currentKey)
    closed.add(currentKey)

    for (const { dx, dz } of DIRECTIONS) {
      const neighbor: Cell = { x: current.x + dx, z: current.z + dz }
      const neighborKey = cellKey(neighbor)
      if (!(neighborKey in ctx.floors) || closed.has(neighborKey)) continue
      if (isBlocked(current, neighbor, ctx.walls)) continue

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey)
        gScore.set(neighborKey, tentativeG)
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal))
        if (!open.has(neighborKey)) open.set(neighborKey, neighbor)
      }
    }
  }

  return null
}

function* fScoreEntries(open: Map<string, Cell>, fScore: Map<string, number>): Generator<[string, number]> {
  for (const key of open.keys()) yield [key, fScore.get(key) ?? Infinity]
}

function reconstructPath(cameFrom: Map<string, string>, currentKey: string, floors: Record<string, Cell>): Cell[] {
  const path: Cell[] = [floors[currentKey]]
  let key = currentKey
  while (cameFrom.has(key)) {
    key = cameFrom.get(key)!
    path.unshift(floors[key])
  }
  return path
}
