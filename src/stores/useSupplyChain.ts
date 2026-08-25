import { create } from 'zustand'
import { PRODUCT_MAP } from '../data/products'
import { SUPPLIER_MAP } from '../data/suppliers'
import { contractUnitPrice, leadTimeArrivalDay, rollDisruption } from '../systems/supplyChainSim'
import { hasManagerOnDuty } from '../systems/staffSimulation'
import { spawnDeliveryTruck } from '../systems/deliveryTruckSim'
import { useFinance } from './useFinance'
import { useInventory } from './useInventory'

const AUTO_REORDER_THRESHOLD = 40
const AUTO_REORDER_QUANTITY = 100

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
  /** A manager on duty auto-reorders any signed-contract product whose
   * stockroom + in-transit total is running low, so the player doesn't
   * have to babysit restocking manually. */
  tickManagerAutoReorder: (currentDay: number) => void
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
    spawnDeliveryTruck(supplierId)
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

  tickManagerAutoReorder: (currentDay) => {
    if (!hasManagerOnDuty()) return
    const state = get()
    const inventory = useInventory.getState()

    for (const productId of Object.keys(state.contracts)) {
      const stockroomQty = inventory.stockroom[productId] ?? 0
      const pendingQty = get()
        .pendingOrders.filter((o) => o.productId === productId)
        .reduce((sum, o) => sum + o.quantity, 0)
      if (stockroomQty + pendingQty < AUTO_REORDER_THRESHOLD) {
        const placed = get().placeContractOrder(productId, AUTO_REORDER_QUANTITY, currentDay)
        if (placed) {
          const product = PRODUCT_MAP[productId]
          set((s) => ({ events: [`🧑‍💼 Manager auto-ordered ${AUTO_REORDER_QUANTITY} ${product.name}`, ...s.events].slice(0, 8) }))
        }
      }
    }
  },
}))
