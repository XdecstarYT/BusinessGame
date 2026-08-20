// Pure-ish movement helpers shared by customerSimulation and staffSimulation
// — both drive NPCs along A* paths the same way, so the stepping/routing
// logic lives here once instead of being duplicated per simulation.
import * as THREE from 'three'
import { findPath, type WallSegment } from './pathfinding'
import { cellCenterToWorld, worldToCell, type Cell } from './grid'

export const ARRIVE_EPSILON = 0.08

export interface Moveable {
  position: THREE.Vector3
  rotationY: number
  path: THREE.Vector3[]
  pathIndex: number
}

export interface RouteContext {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
}

export function cellToVec(cell: Cell): THREE.Vector3 {
  const [x, z] = cellCenterToWorld(cell)
  return new THREE.Vector3(x, 0, z)
}

/** Steps an entity toward the next path waypoint. Returns true once the end
 * of the path has been reached this frame. */
export function moveAlongPath(entity: Moveable, speed: number, delta: number): boolean {
  if (entity.pathIndex >= entity.path.length) return true
  const target = entity.path[entity.pathIndex]
  const toTarget = new THREE.Vector3().subVectors(target, entity.position)
  const distance = toTarget.length()

  if (distance < ARRIVE_EPSILON) {
    entity.pathIndex += 1
    return entity.pathIndex >= entity.path.length
  }

  toTarget.normalize()
  entity.position.addScaledVector(toTarget, Math.min(distance, speed * delta))
  entity.rotationY = Math.atan2(toTarget.x, toTarget.z)
  return false
}

/** Recomputes an entity's path from its current position to a goal cell.
 * Returns false (leaving the entity's path untouched) if no route exists. */
export function routeEntityTo(entity: Moveable, goal: Cell, ctx: RouteContext): boolean {
  const fromCell = worldToCell(entity.position.x, entity.position.z)
  const cellPath = findPath(fromCell, goal, ctx)
  if (!cellPath) return false
  entity.path = cellPath.map(cellToVec)
  entity.pathIndex = 0
  return true
}
