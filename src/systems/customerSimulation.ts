// Impure orchestrator driving the live customer population. Deliberately
// outside Zustand/React: position and path progress mutate every frame, and
// routing that through store state would re-render every subscriber once per
// customer per frame. Discrete events (spawn/despawn count, sales) still flow
// into Zustand (useCustomers/useFinance/useInventory) via their action
// creators, since the UI genuinely needs to react to those.
import * as THREE from 'three'
import { useStoreLayout, type PlacedFixture } from '../stores/useStoreLayout'
import { useInventory } from '../stores/useInventory'
import { useFinance } from '../stores/useFinance'
import { useCustomers } from '../stores/useCustomers'
import { PRODUCT_MAP } from '../data/products'
import { findPath, type WallSegment } from './pathfinding'
import { cellCenterToWorld, worldToCell, type Cell } from './grid'
import {
  cartTotal,
  pickCheckout,
  pickEntranceCell,
  pickShoppingTarget,
  randomWantCount,
  type CartLine,
  type CustomerPhase,
  type ShoppableFixture,
} from './customerAI'

export const MAX_CUSTOMERS = 6

const CUSTOMER_SPEED = 1.6
const SHELF_DWELL_SECONDS = 1.2
const CHECKOUT_DWELL_SECONDS = 1.8
const CHECKOUT_POLL_SECONDS = 0.3
const ARRIVE_EPSILON = 0.08
const SPAWN_INTERVAL_MIN = 6
const SPAWN_INTERVAL_MAX = 12

export interface LiveCustomer {
  id: string
  phase: CustomerPhase
  position: THREE.Vector3
  rotationY: number
  path: THREE.Vector3[]
  pathIndex: number
  cart: CartLine[]
  wantCount: number
  visitedShelves: Set<string>
  targetFixtureId: string | null
  checkoutFixtureId: string | null
  dwellTimer: number
}

let customers: LiveCustomer[] = []
let spawnTimer = randomSpawnInterval()
let nextId = 1
const occupiedCheckouts = new Set<string>()

function randomSpawnInterval(): number {
  return SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
}

export function getLiveCustomers(): readonly LiveCustomer[] {
  return customers
}

function cellToVec(cell: Cell): THREE.Vector3 {
  const [x, z] = cellCenterToWorld(cell)
  return new THREE.Vector3(x, 0, z)
}

function toShoppable(fixtures: Record<string, PlacedFixture>): ShoppableFixture[] {
  const list: ShoppableFixture[] = []
  for (const f of Object.values(fixtures)) {
    if (f.category === 'shelf' || f.category === 'checkout') {
      list.push({ id: f.id, category: f.category, cell: f.cell })
    }
  }
  return list
}

function findFixtureCell(fixtures: Record<string, PlacedFixture>, id: string): Cell | null {
  return fixtures[id]?.cell ?? null
}

function spawnEligible(fixtures: Record<string, PlacedFixture>, floors: Record<string, Cell>): boolean {
  if (customers.length >= MAX_CUSTOMERS) return false
  if (Object.keys(floors).length === 0) return false
  const shelfStock = useInventory.getState().shelfStock
  const shoppable = toShoppable(fixtures)
  const hasStock = shoppable.some((f) => f.category === 'shelf' && (shelfStock[f.id]?.quantity ?? 0) > 0)
  const hasCheckout = shoppable.some((f) => f.category === 'checkout')
  return hasStock && hasCheckout
}

function trySpawn(floors: Record<string, Cell>, walls: Record<string, WallSegment>, fixtures: Record<string, PlacedFixture>) {
  const entrance = pickEntranceCell(floors)
  if (!entrance) return

  const shelfStock = useInventory.getState().shelfStock
  const shoppable = toShoppable(fixtures)
  const target = pickShoppingTarget(shoppable, shelfStock, new Set())
  if (!target) return

  const cellPath = findPath(entrance, target.cell, { floors, walls })
  if (!cellPath) return

  customers.push({
    id: `c${nextId++}`,
    phase: 'shopping',
    position: cellToVec(entrance),
    rotationY: 0,
    path: cellPath.map(cellToVec),
    pathIndex: 0,
    cart: [],
    wantCount: randomWantCount(),
    visitedShelves: new Set(),
    targetFixtureId: target.id,
    checkoutFixtureId: null,
    dwellTimer: 0,
  })
  useCustomers.getState().setActiveCount(customers.length)
}

/** Moves the customer toward the next path waypoint. Returns true once the
 * end of the path has been reached this frame. */
function moveAlongPath(customer: LiveCustomer, delta: number): boolean {
  if (customer.pathIndex >= customer.path.length) return true
  const target = customer.path[customer.pathIndex]
  const toTarget = new THREE.Vector3().subVectors(target, customer.position)
  const distance = toTarget.length()

  if (distance < ARRIVE_EPSILON) {
    customer.pathIndex += 1
    return customer.pathIndex >= customer.path.length
  }

  toTarget.normalize()
  customer.position.addScaledVector(toTarget, Math.min(distance, CUSTOMER_SPEED * delta))
  customer.rotationY = Math.atan2(toTarget.x, toTarget.z)
  return false
}

interface StoreSnapshot {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
  fixtures: Record<string, PlacedFixture>
}

function routeTo(customer: LiveCustomer, goal: Cell, snapshot: StoreSnapshot): boolean {
  const fromCell = worldToCell(customer.position.x, customer.position.z)
  const cellPath = findPath(fromCell, goal, snapshot)
  if (!cellPath) return false
  customer.path = cellPath.map(cellToVec)
  customer.pathIndex = 0
  return true
}

/** Called once a shopping-leg path completes: pick up the item, decide the
 * next shelf or head to checkout. */
function onShelfArrival(customer: LiveCustomer, snapshot: StoreSnapshot) {
  const inventory = useInventory.getState()
  const fixtureId = customer.targetFixtureId
  if (fixtureId) {
    const shelf = inventory.shelfStock[fixtureId]
    if (shelf?.productId && inventory.sellFromShelf(fixtureId, 1)) {
      const existing = customer.cart.find((line) => line.productId === shelf.productId)
      if (existing) existing.quantity += 1
      else customer.cart.push({ productId: shelf.productId, quantity: 1 })
    }
    customer.visitedShelves.add(fixtureId)
  }

  const shoppable = toShoppable(snapshot.fixtures)
  const needsMore = customer.cart.length < customer.wantCount
  const nextShelf = needsMore ? pickShoppingTarget(shoppable, inventory.shelfStock, customer.visitedShelves) : null

  if (nextShelf) {
    const cell = findFixtureCell(snapshot.fixtures, nextShelf.id)
    if (cell && routeTo(customer, cell, snapshot)) {
      customer.targetFixtureId = nextShelf.id
      return
    }
  }

  // Done shopping (or nowhere left to go) — head to checkout, or leave if none exists.
  const checkout = pickCheckout(shoppable)
  if (checkout) {
    const cell = findFixtureCell(snapshot.fixtures, checkout.id)
    if (cell && routeTo(customer, cell, snapshot)) {
      customer.checkoutFixtureId = checkout.id
      customer.phase = 'queueing'
      return
    }
  }

  sendHome(customer, snapshot)
}

function onCheckoutQueuePoll(customer: LiveCustomer, snapshot: StoreSnapshot) {
  const fixtureId = customer.checkoutFixtureId
  if (!fixtureId || !(fixtureId in snapshot.fixtures)) {
    sendHome(customer, snapshot)
    return
  }
  if (occupiedCheckouts.has(fixtureId)) {
    customer.dwellTimer = CHECKOUT_POLL_SECONDS
    return
  }
  occupiedCheckouts.add(fixtureId)
  customer.phase = 'checkingOut'
  customer.dwellTimer = CHECKOUT_DWELL_SECONDS
}

function completeCheckout(customer: LiveCustomer, snapshot: StoreSnapshot) {
  if (customer.checkoutFixtureId) occupiedCheckouts.delete(customer.checkoutFixtureId)

  const { revenue, cogs } = cartTotal(customer.cart)
  if (revenue > 0) {
    useFinance.getState().recordSale(revenue, cogs)
    const itemCount = customer.cart.reduce((sum, line) => sum + line.quantity, 0)
    const label = customer.cart.length === 1 ? (PRODUCT_MAP[customer.cart[0].productId]?.name ?? 'item') : `${itemCount} items`
    useCustomers.getState().recordSaleEvent(`Sale: $${revenue.toFixed(2)} (${label})`)
  }

  sendHome(customer, snapshot)
}

function sendHome(customer: LiveCustomer, snapshot: StoreSnapshot) {
  const entrance = pickEntranceCell(snapshot.floors)
  customer.phase = 'leaving'
  if (entrance && routeTo(customer, entrance, snapshot)) return
  // No route back — just despawn in place next tick.
  customer.path = []
  customer.pathIndex = 0
}

export function tickCustomers(delta: number): void {
  const floors = useStoreLayout.getState().floors
  const walls = useStoreLayout.getState().walls
  const fixtures = useStoreLayout.getState().fixtures
  const snapshot: StoreSnapshot = { floors, walls, fixtures }

  spawnTimer -= delta
  if (spawnTimer <= 0) {
    spawnTimer = randomSpawnInterval()
    if (spawnEligible(fixtures, floors)) trySpawn(floors, walls, fixtures)
  }

  const remaining: LiveCustomer[] = []

  for (const customer of customers) {
    if (customer.dwellTimer > 0) {
      customer.dwellTimer -= delta
      if (customer.dwellTimer <= 0) {
        if (customer.phase === 'shopping') onShelfArrival(customer, snapshot)
        else if (customer.phase === 'queueing') onCheckoutQueuePoll(customer, snapshot)
        else if (customer.phase === 'checkingOut') completeCheckout(customer, snapshot)
      }
    } else if (customer.pathIndex < customer.path.length) {
      const arrived = moveAlongPath(customer, delta)
      if (arrived) {
        // Browse for a beat before picking an item off the shelf.
        if (customer.phase === 'shopping') customer.dwellTimer = SHELF_DWELL_SECONDS
        else if (customer.phase === 'queueing') onCheckoutQueuePoll(customer, snapshot)
      }
    }

    const reachedHome = customer.phase === 'leaving' && customer.pathIndex >= customer.path.length
    if (!reachedHome) remaining.push(customer)
    else if (customer.checkoutFixtureId) occupiedCheckouts.delete(customer.checkoutFixtureId)
  }

  customers = remaining
  if (customers.length !== useCustomers.getState().activeCount) {
    useCustomers.getState().setActiveCount(customers.length)
  }
}
