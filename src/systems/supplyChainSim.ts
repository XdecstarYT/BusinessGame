// Pure — no React/Three imports, unit-testable in isolation.
import type { SupplierDefinition } from '../data/suppliers'

/** Bulk order size unlocks a further discount on top of the supplier's own
 * price multiplier — the "negotiate bulk-discount tiers" mechanic. */
export function bulkDiscountMultiplier(quantity: number): number {
  if (quantity >= 200) return 0.85
  if (quantity >= 100) return 0.9
  if (quantity >= 50) return 0.95
  return 1
}

/** Per-unit cost for a contract order through a given supplier. */
export function contractUnitPrice(baseCostPrice: number, supplier: SupplierDefinition, quantity: number): number {
  return baseCostPrice * supplier.priceMultiplier * bulkDiscountMultiplier(quantity)
}

export function leadTimeArrivalDay(currentDay: number, supplier: SupplierDefinition): number {
  return currentDay + supplier.leadTimeDays
}

export interface DisruptionOutcome {
  disrupted: boolean
  /** Fraction (0-1) of the ordered quantity actually delivered this cycle. */
  deliveredFraction: number
  /** Extra days added before the remainder (if any) arrives. */
  delayDays: number
}

/** Rolls whether a pending delivery is disrupted. Reliability is the chance
 * of a full, on-time delivery; below that, either a partial short-shipment
 * or a straight delay lands, weighted toward the less severe outcome. */
export function rollDisruption(reliability: number, random: () => number = Math.random): DisruptionOutcome {
  if (random() < reliability) {
    return { disrupted: false, deliveredFraction: 1, delayDays: 0 }
  }
  if (random() < 0.5) {
    return { disrupted: true, deliveredFraction: 0.5 + random() * 0.3, delayDays: 0 }
  }
  return { disrupted: true, deliveredFraction: 0, delayDays: 1 + Math.floor(random() * 2) }
}
