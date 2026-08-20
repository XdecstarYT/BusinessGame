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
): ShoppableFixture | null {
  const candidates = fixtures.filter(
    (f) => f.category === 'shelf' && !visited.has(f.id) && (shelfStock[f.id]?.quantity ?? 0) > 0,
  )
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function pickCheckout(fixtures: ShoppableFixture[]): ShoppableFixture | null {
  const candidates = fixtures.filter((f) => f.category === 'checkout')
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function cartTotal(cart: CartLine[]): { revenue: number; cogs: number } {
  return cart.reduce(
    (acc, line) => {
      const product = PRODUCT_MAP[line.productId]
      if (!product) return acc
      return {
        revenue: acc.revenue + product.retailPrice * line.quantity,
        cogs: acc.cogs + product.costPrice * line.quantity,
      }
    },
    { revenue: 0, cogs: 0 },
  )
}

export function randomWantCount(): number {
  return 1 + Math.floor(Math.random() * 3)
}
