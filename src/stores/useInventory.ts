import { create } from 'zustand'
import { PRODUCT_MAP, SHELF_CAPACITY, STOCKROOM_CAPACITY } from '../data/products'
import { useFinance } from './useFinance'

export interface ShelfStock {
  productId: string | null
  quantity: number
}

interface InventoryState {
  stockroom: Record<string, number>
  shelfStock: Record<string, ShelfStock>

  totalStockroomUnits: () => number
  orderProduct: (productId: string, quantity: number) => boolean
  assignProduct: (fixtureId: string, productId: string) => void
  restockShelf: (fixtureId: string, quantity: number) => void
  sellFromShelf: (fixtureId: string, quantity: number) => boolean
  removeFixture: (fixtureId: string) => void
}

export const useInventory = create<InventoryState>((set, get) => ({
  stockroom: {},
  shelfStock: {},

  totalStockroomUnits: () => Object.values(get().stockroom).reduce((sum, qty) => sum + qty, 0),

  orderProduct: (productId, quantity) => {
    const product = PRODUCT_MAP[productId]
    if (!product || quantity <= 0) return false
    const state = get()
    const allowedQty = Math.min(quantity, STOCKROOM_CAPACITY - state.totalStockroomUnits())
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
}))
