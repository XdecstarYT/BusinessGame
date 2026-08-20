// Impure orchestrator driving the live customer population. Deliberately
// outside Zustand/React: position and path progress mutate every frame, and
// routing that through store state would re-render every subscriber once per
// customer per frame. Discrete events (spawn/despawn count, sales) still flow
// into Zustand (useCustomers/useFinance/useInventory) via their action
// creators, since the UI genuinely needs to react to those.
import * as THREE from 'three'
import { useStoreLayout, type PlacedFixture } from '../stores/useStoreLayout'
import { useInventory, getEffectivePrice } from '../stores/useInventory'
import { useFinance } from '../stores/useFinance'
import { useGameClock } from '../stores/useGameClock'
import { useCustomers } from '../stores/useCustomers'
import { useStoreAtmosphere } from '../stores/useStoreAtmosphere'
import { useReputation } from '../stores/useReputation'
import { useMarketing } from '../stores/useMarketing'
import { useCorporateFinance } from '../stores/useCorporateFinance'
import { INSURANCE_REIMBURSEMENT_RATE } from '../data/finance'
import { useCompetitors } from '../stores/useCompetitors'
import { PRODUCT_MAP } from '../data/products'
import type { WallSegment } from './pathfinding'
import type { Cell } from './grid'
import { cellToVec, moveAlongPath, routeEntityTo } from './movement'
import { checkoutStaffing, isSecurityOnDuty } from './staffSimulation'
import { checkoutDwellMultiplier, theftDeterrenceMultiplier } from './staffAI'
import { spawnSalePop } from './salePops'
import { PERSONAS, randomPersona, randomWantCountFor, type PersonaId } from '../data/personas'
import {
  cartTotal,
  pickCheckout,
  pickEntranceCell,
  pickShoppingTarget,
  type CartLine,
  type CustomerPhase,
  type ShoppableFixture,
} from './customerAI'

export const MAX_CUSTOMERS = 6

const CUSTOMER_SPEED = 1.6
const SHELF_DWELL_SECONDS = 1.2
const BASE_CHECKOUT_DWELL_SECONDS = 1.8
const CHECKOUT_POLL_SECONDS = 0.3
const SPAWN_INTERVAL_MIN = 6
const SPAWN_INTERVAL_MAX = 12
const LONG_QUEUE_SECONDS = 5
const BASE_SHOPLIFTER_CHANCE = 0.08
const PER_ITEM_STEAL_CHANCE = 0.5
const CATCH_CHANCE = 0.7

function priceOfProduct(productId: string): number {
  return getEffectivePrice(productId, useGameClock.getState().day)
}

export interface LiveCustomer {
  id: string
  persona: PersonaId
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
  queueWaitTime: number
  isShoplifter: boolean
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

  const persona = randomPersona()
  const { priceSensitivity } = PERSONAS[persona]
  const shelfStock = useInventory.getState().shelfStock
  const shoppable = toShoppable(fixtures)
  const target = pickShoppingTarget(shoppable, shelfStock, new Set(), priceOfProduct, priceSensitivity)
  if (!target) return

  const customer: LiveCustomer = {
    id: `c${nextId++}`,
    persona,
    phase: 'shopping',
    position: cellToVec(entrance),
    rotationY: 0,
    path: [],
    pathIndex: 0,
    cart: [],
    wantCount: randomWantCountFor(persona),
    visitedShelves: new Set(),
    targetFixtureId: target.id,
    checkoutFixtureId: null,
    dwellTimer: 0,
    queueWaitTime: 0,
    isShoplifter: Math.random() < BASE_SHOPLIFTER_CHANCE * theftDeterrenceMultiplier(isSecurityOnDuty()),
  }
  if (!routeEntityTo(customer, target.cell, { floors, walls })) return

  customers.push(customer)
  useCustomers.getState().setActiveCount(customers.length)
}

interface StoreSnapshot {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
  fixtures: Record<string, PlacedFixture>
}

/** Called once a shopping-leg path completes: pick up the item, decide the
 * next shelf or head to checkout. */
function onShelfArrival(customer: LiveCustomer, snapshot: StoreSnapshot) {
  const inventory = useInventory.getState()
  const fixtureId = customer.targetFixtureId
  if (fixtureId) {
    const shelf = inventory.shelfStock[fixtureId]
    if (shelf?.productId) {
      const attemptTheft = customer.isShoplifter && Math.random() < PER_ITEM_STEAL_CHANCE
      if (attemptTheft) {
        const caught = isSecurityOnDuty() && Math.random() < CATCH_CHANCE
        if (caught) {
          useCustomers.getState().recordSaleEvent('🚨 Security caught a shoplifter!')
        } else if (inventory.sellFromShelf(fixtureId, 1)) {
          const product = PRODUCT_MAP[shelf.productId]
          const insured = useCorporateFinance.getState().insuranceActive
          const netLoss = insured ? product.costPrice * (1 - INSURANCE_REIMBURSEMENT_RATE) : product.costPrice
          useFinance.getState().recordShrinkage(netLoss)
          useCustomers.getState().recordSaleEvent(
            insured ? `⚠️ Shoplifting loss: $${netLoss.toFixed(2)} (insured)` : `⚠️ Shoplifting loss: $${netLoss.toFixed(2)}`,
          )
        }
      } else if (inventory.sellFromShelf(fixtureId, 1)) {
        const existing = customer.cart.find((line) => line.productId === shelf.productId)
        if (existing) existing.quantity += 1
        else customer.cart.push({ productId: shelf.productId, quantity: 1 })
      }
    }
    customer.visitedShelves.add(fixtureId)
  }

  const shoppable = toShoppable(snapshot.fixtures)
  const needsMore = customer.cart.length < customer.wantCount
  const { priceSensitivity } = PERSONAS[customer.persona]
  const nextShelf = needsMore
    ? pickShoppingTarget(shoppable, inventory.shelfStock, customer.visitedShelves, priceOfProduct, priceSensitivity)
    : null

  if (nextShelf) {
    const cell = findFixtureCell(snapshot.fixtures, nextShelf.id)
    if (cell && routeEntityTo(customer, cell, snapshot)) {
      customer.targetFixtureId = nextShelf.id
      return
    }
  }

  // Done shopping (or nowhere left to go) — head to checkout, or leave if none exists.
  const checkout = pickCheckout(shoppable)
  if (checkout) {
    const cell = findFixtureCell(snapshot.fixtures, checkout.id)
    if (cell && routeEntityTo(customer, cell, snapshot)) {
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
  const { staffed, morale } = checkoutStaffing(fixtureId)
  customer.dwellTimer = BASE_CHECKOUT_DWELL_SECONDS * checkoutDwellMultiplier(staffed, morale)
  if (customer.queueWaitTime > LONG_QUEUE_SECONDS) useReputation.getState().hitFromLongQueue()
}

function completeCheckout(customer: LiveCustomer, snapshot: StoreSnapshot) {
  if (customer.checkoutFixtureId) occupiedCheckouts.delete(customer.checkoutFixtureId)

  const { revenue, cogs } = cartTotal(customer.cart, priceOfProduct)
  if (revenue > 0) {
    useFinance.getState().recordSale(revenue, cogs)
    useStoreAtmosphere.getState().dirtyFromSale()
    useReputation.getState().boostFromSale()
    const itemCount = customer.cart.reduce((sum, line) => sum + line.quantity, 0)
    const label = customer.cart.length === 1 ? (PRODUCT_MAP[customer.cart[0].productId]?.name ?? 'item') : `${itemCount} items`
    useCustomers.getState().recordSaleEvent(`Sale: $${revenue.toFixed(2)} (${label})`)
    spawnSalePop(new THREE.Vector3(customer.position.x, customer.position.y + 1.6, customer.position.z), revenue)
  }

  sendHome(customer, snapshot)
}

function sendHome(customer: LiveCustomer, snapshot: StoreSnapshot) {
  if (customer.cart.length === 0) useReputation.getState().hitFromStockout()
  const entrance = pickEntranceCell(snapshot.floors)
  customer.phase = 'leaving'
  if (entrance && routeEntityTo(customer, entrance, snapshot)) return
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
    spawnTimer = randomSpawnInterval() / attractivenessSpawnFactor()
    if (spawnEligible(fixtures, floors)) trySpawn(floors, walls, fixtures)
  }

  const remaining: LiveCustomer[] = []

  for (const customer of customers) {
    if (customer.phase === 'queueing') customer.queueWaitTime += delta

    if (customer.dwellTimer > 0) {
      customer.dwellTimer -= delta
      if (customer.dwellTimer <= 0) {
        if (customer.phase === 'shopping') onShelfArrival(customer, snapshot)
        else if (customer.phase === 'queueing') onCheckoutQueuePoll(customer, snapshot)
        else if (customer.phase === 'checkingOut') completeCheckout(customer, snapshot)
      }
    } else if (customer.pathIndex < customer.path.length) {
      const arrived = moveAlongPath(customer, CUSTOMER_SPEED, delta)
      if (arrived) {
        // Browse for a beat before picking an item off the shelf.
        if (customer.phase === 'shopping') customer.dwellTimer = SHELF_DWELL_SECONDS * PERSONAS[customer.persona].dwellMultiplier
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

/** A cleaner, better-lit, better-reviewed, better-advertised store draws
 * customers more often. */
function attractivenessSpawnFactor(): number {
  const atmosphere = useStoreAtmosphere.getState().atmosphereScore()
  const reputation = useReputation.getState().attractivenessFactor()
  const marketingBoost = useMarketing.getState().attractivenessBoost()
  const competitorDrag = useCompetitors.getState().competitorPressure()
  return Math.max(0.15, 0.6 + (atmosphere * 0.5 + reputation * 0.5) * 0.7 + marketingBoost - competitorDrag)
}
