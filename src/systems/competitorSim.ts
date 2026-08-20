// Pure — no React/Zustand imports, unit-testable in isolation.
import type { CompetitorStrategy } from '../data/competitors'
import { STRATEGY_AGGRESSION } from '../data/competitors'

const PRICE_INDEX_MIN = 0.5
const PRICE_INDEX_MAX = 1.6
const DRIFT_SCALE = 0.06
const PULL_TO_BASELINE = 0.1

/** One day's random-walk price move for a competitor, scaled by how
 * aggressively their strategy plays with pricing, gently pulled back
 * toward their strategy's baseline so it doesn't wander forever. */
export function driftPriceIndex(current: number, baseline: number, strategy: CompetitorStrategy, random: () => number = Math.random): number {
  const drift = (random() - 0.5) * DRIFT_SCALE * STRATEGY_AGGRESSION[strategy]
  const next = Math.max(PRICE_INDEX_MIN, Math.min(PRICE_INDEX_MAX, current + drift))
  return next + (baseline - next) * PULL_TO_BASELINE
}
