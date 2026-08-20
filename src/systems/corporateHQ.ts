// Pure — no React/Zustand imports, unit-testable in isolation.

/** Abstracted daily P&L for a chain location beyond the home store — a
 * formula-based stand-in for full 3D/NPC simulation, consistent with the
 * spec's own tiered-fidelity approach (the City Map is already "toy town"
 * background fidelity). Not fake: foot traffic, manager quality, and the
 * home store's own reputation all genuinely drive the number. */
const REVENUE_PER_TRAFFIC_POINT = 3
const BASE_OPERATING_COST = 20
const RENT_COST_FRACTION = 0.0006
/** The "shared distribution center" bonus — a warehouse upgrade at the home
 * store also trims every chain location's operating cost a little. */
const WAREHOUSE_DISCOUNT = 0.9

export interface LocationDailyResult {
  revenue: number
  costs: number
  profit: number
}

export function computeLocationDailyResult(
  footTraffic: number,
  acquisitionCost: number,
  managerQuality: number,
  brandFactor: number,
  hasWarehouseBonus: boolean,
): LocationDailyResult {
  const revenue = footTraffic * REVENUE_PER_TRAFFIC_POINT * managerQuality * brandFactor
  const rawCosts = acquisitionCost * RENT_COST_FRACTION + BASE_OPERATING_COST
  const costs = hasWarehouseBonus ? rawCosts * WAREHOUSE_DISCOUNT : rawCosts
  return { revenue, costs, profit: revenue - costs }
}

/** 0.5..1.0 — a weak location and a strong one both benefit from the home
 * store's brand strength, just not equally. */
export function brandConsistencyFactor(homeReputationScore: number): number {
  return 0.5 + (homeReputationScore / 100) * 0.5
}

export const DEFAULT_MANAGER_QUALITY = 0.5
export const MAX_MANAGER_QUALITY = 1.0
export const MANAGER_QUALITY_STEP = 0.1
export const MANAGER_QUALITY_UPGRADE_COST = 800
