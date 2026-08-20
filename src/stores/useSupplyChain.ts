import { create } from 'zustand'
import { PRODUCT_MAP } from '../data/products'
import { SUPPLIER_MAP } from '../data/suppliers'
import { contractUnitPrice, leadTimeArrivalDay, rollDisruption } from '../systems/supplyChainSim'
import { useFinance } from './useFinance'
import { useInventory } from './useInventory'

export interface PendingOrder {
  id: string
  productId: string
  quantity: number
  supplierId: string
  arrivalDay: number
}

interface SupplyChainState {
  /** One active supplier per product — signing a contract is how a product
   * becomes eligible for the cheaper, lead-time-delayed order path. */
  contracts: Record<string, string>
  pendingOrders: PendingOrder[]
  events: string[]

  signContract: (productId: string, supplierId: string) => void
  cancelContract: (productId: string) => void
  placeContractOrder: (productId: string, quantity: number, currentDay: number) => boolean
  tickDailyDeliveries: (currentDay: number) => void
}

let nextOrderNumber = 1

export const useSupplyChain = create<SupplyChainState>((set, get) => ({
  contracts: {},
  pendingOrders: [],
  events: [],

  signContract: (productId, supplierId) => {
    if (!SUPPLIER_MAP[supplierId] || !PRODUCT_MAP[productId]) return
    set((state) => ({ contracts: { ...state.contracts, [productId]: supplierId } }))
  },

  cancelContract: (productId) => {
    set((state) => {
      if (!(productId in state.contracts)) return state
      const contracts = { ...state.contracts }
      delete contracts[productId]
      return { contracts }
    })
  },

  placeContractOrder: (productId, quantity, currentDay) => {
    const product = PRODUCT_MAP[productId]
    const state = get()
    const supplierId = state.contracts[productId]
    const supplier = supplierId ? SUPPLIER_MAP[supplierId] : undefined
    if (!product || !supplier || quantity <= 0) return false

    const inventory = useInventory.getState()
    const reserved = state.pendingOrders.reduce((sum, o) => sum + o.quantity, 0)
    const room = inventory.stockroomCapacity() - inventory.totalStockroomUnits() - reserved
    const allowedQty = Math.min(quantity, room)
    if (allowedQty <= 0) return false

    const cost = contractUnitPrice(product.costPrice, supplier, allowedQty) * allowedQty
    if (!useFinance.getState().spend(cost)) return false

    const order: PendingOrder = {
      id: `order-${Date.now()}-${nextOrderNumber++}`,
      productId,
      quantity: allowedQty,
      supplierId,
      arrivalDay: leadTimeArrivalDay(currentDay, supplier),
    }
    set({ pendingOrders: [...state.pendingOrders, order] })
    return true
  },

  tickDailyDeliveries: (currentDay) => {
    const state = get()
    const due = state.pendingOrders.filter((o) => o.arrivalDay <= currentDay)
    if (due.length === 0) return

    const remaining: PendingOrder[] = state.pendingOrders.filter((o) => o.arrivalDay > currentDay)
    const newEvents: string[] = []

    for (const order of due) {
      const product = PRODUCT_MAP[order.productId]
      const supplier = SUPPLIER_MAP[order.supplierId]
      if (!product || !supplier) continue

      const outcome = rollDisruption(supplier.reliability)
      if (!outcome.disrupted) {
        const received = useInventory.getState().receiveDelivery(order.productId, order.quantity)
        newEvents.push(`✅ ${received} ${product.name} arrived from ${supplier.name}`)
      } else if (outcome.deliveredFraction > 0) {
        const partialQty = Math.max(1, Math.floor(order.quantity * outcome.deliveredFraction))
        const received = useInventory.getState().receiveDelivery(order.productId, partialQty)
        newEvents.push(`⚠️ Short shipment: only ${received}/${order.quantity} ${product.name} arrived from ${supplier.name}`)
      } else {
        remaining.push({ ...order, arrivalDay: order.arrivalDay + outcome.delayDays })
        newEvents.push(`🚚 ${product.name} shipment from ${supplier.name} delayed ${outcome.delayDays}d`)
      }
    }

    set({ pendingOrders: remaining, events: [...newEvents, ...state.events].slice(0, 8) })
  },
}))
