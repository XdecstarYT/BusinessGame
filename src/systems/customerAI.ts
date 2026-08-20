// Pure decision helpers — no React/Zustand imports, unit-testable in isolation.
// The stateful orchestration (movement, timers, calling into inventory/finance
// stores) lives in customerSimulation.ts; this file only picks targets and
// totals carts.
import type { Cell } from './grid'
import { PRODUCT_MAP } from '../data/products'

export type CustomerPhase = 'shopping' | 'queueing' | 'checkingOut' | 'leaving'

export interface CartLine {
  productId: string
  quantity: number
}

export interface ShoppableFixture {
  id: string
  category: 'shelf' | 'checkout'
  cell: Cell
}

/** The entrance/exit point: the floor cell closest to the store's origin
 * corner, standing in for "front of store" until a real entrance fixture
 * exists. */
export function pickEntranceCell(floors: Record<string, Cell>): Cell | null {
  let best: Cell | null = null
  let bestScore = Infinity
  for (const cell of Object.values(floors)) {
    const score = cell.x + cell.z
    if (score < bestScore) {
      bestScore = score
      best = cell
    }
  }
  return best
}

export function pickShoppingTarget(
  fixtures: ShoppableFixture[],
  shelfStock: Record<string, { productId: string | null; quantity: number }>,
  visited: ReadonlySet<string>,
  priceOf?: (productId: string) => number,
  priceSensitivity = 0,
): ShoppableFixture | null {
  const candidates = fixtures.filter(
    (f) => f.category === 'shelf' && !visited.has(f.id) && (shelfStock[f.id]?.quantity ?? 0) > 0,
  )
  if (candidates.length === 0) return null
  if (candidates.length === 1 || !priceOf || priceSensitivity <= 0) {
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  // Price-sensitive personas weight cheaper shelves more heavily rather than
  // picking uniformly at random among what's stocked.
  const weights = candidates.map((c) => {
    const productId = shelfStock[c.id]?.productId
    const price = productId ? Math.max(0.1, priceOf(productId)) : 1
    return 1 / Math.pow(price, priceSensitivity)
  })
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

export function pickCheckout(fixtures: ShoppableFixture[]): ShoppableFixture | null {
  const candidates = fixtures.filter((f) => f.category === 'checkout')
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function cartTotal(cart: CartLine[], priceOf?: (productId: string) => number): { revenue: number; cogs: number } {
  return cart.reduce(
    (acc, line) => {
      const product = PRODUCT_MAP[line.productId]
      if (!product) return acc
      const price = priceOf ? priceOf(line.productId) : product.retailPrice
      return {
        revenue: acc.revenue + price * line.quantity,
        cogs: acc.cogs + product.costPrice * line.quantity,
      }
    },
    { revenue: 0, cogs: 0 },
  )
}
