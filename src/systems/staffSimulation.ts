// Impure orchestrator for on-duty staff, mirroring customerSimulation's
// architecture: live NPC state (position/path) lives outside Zustand since it
// mutates every frame, while the roster itself (hire/fire/wage/shift) stays
// in useStaff since the UI needs to react to it. Unlike customers, staff are
// long-lived — one LiveStaffNPC per roster entry, synced each tick rather
// than spawned/despawned.
import * as THREE from 'three'
import { useStaff, type StaffMember } from '../stores/useStaff'
import { useStoreLayout, type PlacedFixture } from '../stores/useStoreLayout'
import { useInventory } from '../stores/useInventory'
import { useStoreAtmosphere } from '../stores/useStoreAtmosphere'
import { currentGameHour } from '../stores/useGameClock'
import { isOnDuty, moraleEfficiency } from './staffAI'
import { cellToVec, moveAlongPath, routeEntityTo } from './movement'
import { pickEntranceCell } from './customerAI'
import { SHELF_CAPACITY } from '../data/products'
import type { Cell } from './grid'
import type { WallSegment } from './pathfinding'
import type { StaffRole } from '../data/staffDefinitions'

const STAFF_SPEED = 1.4
const RESTOCK_DWELL_SECONDS = 1.5
const CLEAN_DWELL_SECONDS = 1.2
const IDLE_COOLDOWN_MIN = 2
const IDLE_COOLDOWN_MAX = 4
const SHELF_RESTOCK_THRESHOLD = 0.6
const BASE_RESTOCK_AMOUNT = 10
const BASE_CLEAN_AMOUNT = 15

export interface LiveStaffNPC {
  id: string
  role: StaffRole
  onDuty: boolean
  position: THREE.Vector3
  rotationY: number
  path: THREE.Vector3[]
  pathIndex: number
  actionTimer: number
  /** Whether arriving at the end of `path` should trigger completeAction —
   * true for a stocker en route to a shelf or a janitor en route to clean,
   * false for a cashier just parking at their checkout. */
  pendingAction: boolean
  cooldown: number
  targetFixtureId: string | null
}

const staffNPCs = new Map<string, LiveStaffNPC>()

export function getLiveStaff(): readonly LiveStaffNPC[] {
  return Array.from(staffNPCs.values())
}

/** Whether a checkout has an on-duty cashier assigned to it right now, and
 * that cashier's morale — consumed by customerSimulation to speed up dwell. */
export function checkoutStaffing(fixtureId: string): { staffed: boolean; morale: number } {
  const hour = currentGameHour()
  for (const member of Object.values(useStaff.getState().roster)) {
    if (member.role === 'cashier' && member.assignedFixtureId === fixtureId && isOnDuty(member.shift, hour)) {
      return { staffed: true, morale: member.morale }
    }
  }
  return { staffed: false, morale: 0 }
}

/** Whether any security guard is currently on duty — consumed by
 * customerSimulation's theft rolls. */
export function isSecurityOnDuty(): boolean {
  const hour = currentGameHour()
  return Object.values(useStaff.getState().roster).some((m) => m.role === 'security' && isOnDuty(m.shift, hour))
}

function randomCooldown(): number {
  return IDLE_COOLDOWN_MIN + Math.random() * (IDLE_COOLDOWN_MAX - IDLE_COOLDOWN_MIN)
}

interface StoreSnapshot {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
  fixtures: Record<string, PlacedFixture>
}

function syncRoster(roster: Record<string, StaffMember>, depot: Cell | null) {
  for (const id of staffNPCs.keys()) {
    if (!(id in roster)) staffNPCs.delete(id)
  }
  for (const member of Object.values(roster)) {
    if (staffNPCs.has(member.id)) continue
    staffNPCs.set(member.id, {
      id: member.id,
      role: member.role,
      onDuty: false,
      position: depot ? cellToVec(depot) : new THREE.Vector3(),
      rotationY: 0,
      path: [],
      pathIndex: 0,
      actionTimer: 0,
      pendingAction: false,
      cooldown: randomCooldown(),
      targetFixtureId: null,
    })
  }
}

function pickRestockTarget(
  fixtures: Record<string, PlacedFixture>,
  shelfStock: ReturnType<typeof useInventory.getState>['shelfStock'],
  stockroom: Record<string, number>,
): PlacedFixture | null {
  let best: PlacedFixture | null = null
  let bestDeficit = 0
  for (const fixture of Object.values(fixtures)) {
    if (fixture.category !== 'shelf') continue
    const stock = shelfStock[fixture.id]
    if (!stock?.productId) continue
    if ((stockroom[stock.productId] ?? 0) <= 0) continue
    const fillRatio = stock.quantity / SHELF_CAPACITY
    if (fillRatio >= SHELF_RESTOCK_THRESHOLD) continue
    const deficit = 1 - fillRatio
    if (deficit > bestDeficit) {
      bestDeficit = deficit
      best = fixture
    }
  }
  return best
}

function tickStocker(npc: LiveStaffNPC, snapshot: StoreSnapshot) {
  const inventory = useInventory.getState()
  const target = pickRestockTarget(snapshot.fixtures, inventory.shelfStock, inventory.stockroom)
  if (target && routeEntityTo(npc, target.cell, snapshot)) {
    npc.targetFixtureId = target.id
    npc.pendingAction = true
    return
  }
  returnToDepot(npc, snapshot)
}

function tickJanitor(npc: LiveStaffNPC, snapshot: StoreSnapshot) {
  const floorCells = Object.values(snapshot.floors)
  if (floorCells.length === 0) {
    npc.cooldown = randomCooldown()
    return
  }
  const target = floorCells[Math.floor(Math.random() * floorCells.length)]
  if (routeEntityTo(npc, target, snapshot)) {
    npc.targetFixtureId = null
    npc.pendingAction = true
  }
}

function tickCashier(npc: LiveStaffNPC, member: StaffMember, snapshot: StoreSnapshot) {
  npc.cooldown = randomCooldown() * 3
  if (!member.assignedFixtureId || !(member.assignedFixtureId in snapshot.fixtures)) {
    returnToDepot(npc, snapshot)
    return
  }
  if (npc.targetFixtureId !== member.assignedFixtureId) {
    const cell = snapshot.fixtures[member.assignedFixtureId].cell
    routeEntityTo(npc, cell, snapshot)
    npc.targetFixtureId = member.assignedFixtureId
  }
  npc.pendingAction = false
}

function tickSecurity(npc: LiveStaffNPC, snapshot: StoreSnapshot) {
  const floorCells = Object.values(snapshot.floors)
  if (floorCells.length === 0) {
    npc.cooldown = randomCooldown()
    return
  }
  const target = floorCells[Math.floor(Math.random() * floorCells.length)]
  routeEntityTo(npc, target, snapshot)
  npc.targetFixtureId = null
  npc.pendingAction = false
}

function returnToDepot(npc: LiveStaffNPC, snapshot: StoreSnapshot) {
  const depot = pickEntranceCell(snapshot.floors)
  npc.targetFixtureId = null
  npc.pendingAction = false
  npc.cooldown = randomCooldown()
  if (depot) routeEntityTo(npc, depot, snapshot)
}

function completeAction(npc: LiveStaffNPC, member: StaffMember) {
  const efficiency = moraleEfficiency(member.morale)
  if (npc.role === 'stocker' && npc.targetFixtureId) {
    useInventory.getState().restockShelf(npc.targetFixtureId, Math.round(BASE_RESTOCK_AMOUNT * efficiency))
  } else if (npc.role === 'janitor') {
    useStoreAtmosphere.getState().cleanBy(BASE_CLEAN_AMOUNT * efficiency)
  }
  npc.targetFixtureId = null
  npc.pendingAction = false
  npc.cooldown = randomCooldown()
}

export function tickStaff(delta: number): void {
  const roster = useStaff.getState().roster
  const floors = useStoreLayout.getState().floors
  const walls = useStoreLayout.getState().walls
  const fixtures = useStoreLayout.getState().fixtures
  const snapshot: StoreSnapshot = { floors, walls, fixtures }
  const depot = pickEntranceCell(floors)
  const hour = currentGameHour()

  syncRoster(roster, depot)

  for (const npc of staffNPCs.values()) {
    const member = roster[npc.id]
    if (!member) continue

    npc.onDuty = isOnDuty(member.shift, hour)
    if (!npc.onDuty) continue

    if (npc.actionTimer > 0) {
      npc.actionTimer -= delta
      if (npc.actionTimer <= 0) completeAction(npc, member)
      continue
    }

    if (npc.pathIndex < npc.path.length) {
      const arrived = moveAlongPath(npc, STAFF_SPEED, delta)
      if (arrived && npc.pendingAction) {
        npc.actionTimer = npc.role === 'janitor' ? CLEAN_DWELL_SECONDS : RESTOCK_DWELL_SECONDS
      }
      continue
    }

    npc.cooldown -= delta
    if (npc.cooldown > 0) continue

    if (npc.role === 'stocker') tickStocker(npc, snapshot)
    else if (npc.role === 'janitor') tickJanitor(npc, snapshot)
    else if (npc.role === 'cashier') tickCashier(npc, member, snapshot)
    else if (npc.role === 'security') tickSecurity(npc, snapshot)
  }
}
