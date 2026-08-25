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

/** Reactivity applied on top of an already-close player price — how hard
 * this strategy chases the player down (or ignores them entirely). Premium
 * chains bank on brand loyalty and barely react to being undercut. */
const PRICE_CHASE_REACTIVITY: Record<CompetitorStrategy, number> = {
  discounter: 0.16,
  premium: 0.02,
  'aggressive-expander': 0.12,
}

/** Same random-walk drift as driftPriceIndex, but also nudges the
 * competitor's price toward the player's current price index when the
 * player is undercutting them — a discounter or aggressive expander fights
 * back on price, a premium chain mostly doesn't. */
export function reactiveDriftPriceIndex(
  current: number,
  baseline: number,
  strategy: CompetitorStrategy,
  playerPriceIndex: number,
  random: () => number = Math.random,
): number {
  const drift = (random() - 0.5) * DRIFT_SCALE * STRATEGY_AGGRESSION[strategy]
  const chase = playerPriceIndex < current ? (playerPriceIndex - current) * PRICE_CHASE_REACTIVITY[strategy] : 0
  const next = Math.max(PRICE_INDEX_MIN, Math.min(PRICE_INDEX_MAX, current + drift + chase))
  return next + (baseline - next) * PULL_TO_BASELINE * 0.6
}

/** A price war is "on" once a non-premium competitor's price has been
 * chased down close to (or below) the player's — used purely to decide
 * when to surface a rivalry event/badge, not to change the economy math
 * further (that already happened via reactiveDriftPriceIndex). */
export function isPriceWar(competitorPriceIndex: number, playerPriceIndex: number, strategy: CompetitorStrategy): boolean {
  if (strategy === 'premium') return false
  return competitorPriceIndex - playerPriceIndex < 0.12
}
