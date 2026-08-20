import { create } from 'zustand'
import { PRODUCT_MAP, SHELF_CAPACITY } from '../data/products'
import { WAREHOUSE_TIERS, capacityForTier } from '../data/warehouse'
import { useFinance } from './useFinance'

export interface ShelfStock {
  productId: string | null
  quantity: number
}

export interface Promotion {
  discountPercent: number
  expiresDay: number
}

const PRICE_STEP = 0.25
const MIN_PRICE = 0.1

interface InventoryState {
  stockroom: Record<string, number>
  shelfStock: Record<string, ShelfStock>
  priceOverrides: Record<string, number>
  promotions: Record<string, Promotion>
  warehouseTier: number

  totalStockroomUnits: () => number
  stockroomCapacity: () => number
  upgradeWarehouse: () => boolean
  /** Adds units delivered by a supplier order (systems/useSupplyChain), capped
   * to remaining room — returns the quantity actually received. */
  receiveDelivery: (productId: string, quantity: number) => number
  orderProduct: (productId: string, quantity: number) => boolean
  assignProduct: (fixtureId: string, productId: string) => void
  restockShelf: (fixtureId: string, quantity: number) => void
  sellFromShelf: (fixtureId: string, quantity: number) => boolean
  removeFixture: (fixtureId: string) => void

  adjustPrice: (productId: string, delta: number) => void
  resetPrice: (productId: string) => void
  startPromotion: (productId: string, discountPercent: number, currentDay: number, durationDays: number) => void
  clearPromotion: (productId: string) => void
}

export const useInventory = create<InventoryState>((set, get) => ({
  stockroom: {},
  shelfStock: {},
  priceOverrides: {},
  promotions: {},
  warehouseTier: 0,

  totalStockroomUnits: () => Object.values(get().stockroom).reduce((sum, qty) => sum + qty, 0),

  stockroomCapacity: () => capacityForTier(get().warehouseTier),

  upgradeWarehouse: () => {
    const state = get()
    const nextTier = state.warehouseTier + 1
    const def = WAREHOUSE_TIERS[nextTier]
    if (!def) return false
    if (!useFinance.getState().spend(def.upgradeCost)) return false
    set({ warehouseTier: nextTier })
    return true
  },

  receiveDelivery: (productId, quantity) => {
    if (quantity <= 0) return 0
    const state = get()
    const room = state.stockroomCapacity() - state.totalStockroomUnits()
    const received = Math.max(0, Math.min(quantity, room))
    if (received > 0) {
      set({ stockroom: { ...state.stockroom, [productId]: (state.stockroom[productId] ?? 0) + received } })
    }
    return received
  },

  orderProduct: (productId, quantity) => {
    const product = PRODUCT_MAP[productId]
    if (!product || quantity <= 0) return false
    const state = get()
    const allowedQty = Math.min(quantity, state.stockroomCapacity() - state.totalStockroomUnits())
    if (allowedQty <= 0) return false
    const cost = product.costPrice * allowedQty
    if (!useFinance.getState().spend(cost)) return false
    set({
      stockroom: { ...state.stockroom, [productId]: (state.stockroom[productId] ?? 0) + allowedQty },
    })
    return true
  },

  assignProduct: (fixtureId, productId) => {
    set((state) => ({
      shelfStock: { ...state.shelfStock, [fixtureId]: { productId, quantity: 0 } },
    }))
  },

  restockShelf: (fixtureId, quantity) => {
    const state = get()
    const shelf = state.shelfStock[fixtureId]
    if (!shelf?.productId || quantity <= 0) return
    const available = state.stockroom[shelf.productId] ?? 0
    const room = SHELF_CAPACITY - shelf.quantity
    const moveQty = Math.min(quantity, available, room)
    if (moveQty <= 0) return
    set({
      stockroom: { ...state.stockroom, [shelf.productId]: available - moveQty },
      shelfStock: { ...state.shelfStock, [fixtureId]: { ...shelf, quantity: shelf.quantity + moveQty } },
    })
  },

  sellFromShelf: (fixtureId, quantity) => {
    const state = get()
    const shelf = state.shelfStock[fixtureId]
    if (!shelf || shelf.quantity < quantity) return false
    set({
      shelfStock: { ...state.shelfStock, [fixtureId]: { ...shelf, quantity: shelf.quantity - quantity } },
    })
    return true
  },

  removeFixture: (fixtureId) => {
    set((state) => {
      if (!(fixtureId in state.shelfStock)) return state
      const shelfStock = { ...state.shelfStock }
      delete shelfStock[fixtureId]
      return { shelfStock }
    })
  },

  adjustPrice: (productId, delta) => {
    const product = PRODUCT_MAP[productId]
    if (!product) return
    set((state) => {
      const current = state.priceOverrides[productId] ?? product.retailPrice
      const next = Math.max(MIN_PRICE, Math.round((current + delta) / PRICE_STEP) * PRICE_STEP)
      return { priceOverrides: { ...state.priceOverrides, [productId]: next } }
    })
  },

  resetPrice: (productId) => {
    set((state) => {
      if (!(productId in state.priceOverrides)) return state
      const priceOverrides = { ...state.priceOverrides }
      delete priceOverrides[productId]
      return { priceOverrides }
    })
  },

  startPromotion: (productId, discountPercent, currentDay, durationDays) => {
    set((state) => ({
      promotions: { ...state.promotions, [productId]: { discountPercent, expiresDay: currentDay + durationDays } },
    }))
  },

  clearPromotion: (productId) => {
    set((state) => {
      if (!(productId in state.promotions)) return state
      const promotions = { ...state.promotions }
      delete promotions[productId]
      return { promotions }
    })
  },
}))

/** Current selling price for a product — the player's override (if set),
 * discounted further by an active promotion (if one hasn't expired). Takes
 * `currentDay` as a parameter rather than importing useGameClock directly,
 * since useGameClock already imports this module for staff-workload counts
 * and a cycle between the two would be fragile. */
export function getEffectivePrice(productId: string, currentDay: number): number {
  const product = PRODUCT_MAP[productId]
  if (!product) return 1
  const state = useInventory.getState()
  const base = state.priceOverrides[productId] ?? product.retailPrice
  const promo = state.promotions[productId]
  if (promo && promo.expiresDay >= currentDay) {
    return Math.max(MIN_PRICE, base * (1 - promo.discountPercent / 100))
  }
  return base
}
