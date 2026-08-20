export type CompetitorStrategy = 'discounter' | 'premium' | 'aggressive-expander'

export interface CompetitorChainDefinition {
  id: string
  name: string
  strategy: CompetitorStrategy
  color: string
  description: string
}

export const COMPETITOR_CHAINS: CompetitorChainDefinition[] = [
  { id: 'valumart', name: 'ValuMart', strategy: 'discounter', color: '#dc2626', description: 'Undercuts on price, thin margins, high volume.' },
  { id: 'presticorp', name: 'Presti Corp', strategy: 'premium', color: '#7c3aed', description: 'Premium pricing, banks on brand loyalty.' },
  { id: 'sprintretail', name: 'Sprint Retail', strategy: 'aggressive-expander', color: '#0891b2', description: 'Opens new locations fast, fights hard for market share.' },
]

export const COMPETITOR_CHAIN_MAP: Record<string, CompetitorChainDefinition> = Object.fromEntries(COMPETITOR_CHAINS.map((c) => [c.id, c]))

/** Relative to 1.0 = your baseline pricing. */
export const STRATEGY_PRICE_INDEX: Record<CompetitorStrategy, number> = {
  discounter: 0.8,
  premium: 1.25,
  'aggressive-expander': 0.95,
}

/** 0-1 — how much this strategy pulls customer attractiveness away from
 * your store and how much its pricing drifts week to week. */
export const STRATEGY_AGGRESSION: Record<CompetitorStrategy, number> = {
  discounter: 0.7,
  premium: 0.3,
  'aggressive-expander': 0.6,
}

export const CONTESTED_ACQUISITION_MULTIPLIER = 1.5
export const CITY_EVOLUTION_INTERVAL_DAYS = 14
export const CITY_EVOLUTION_OPEN_CHANCE = 0.5
