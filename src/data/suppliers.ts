export type SupplierOrigin = 'local' | 'imported'

export interface SupplierDefinition {
  id: string
  name: string
  origin: SupplierOrigin
  /** Multiplier applied to a product's base costPrice for this supplier. */
  priceMultiplier: number
  /** 0-1 chance a delivery arrives on time and in full; the rest of the
   * time it's delayed or short — see systems/supplyChainSim.ts. */
  reliability: number
  leadTimeDays: number
  description: string
}

export const SUPPLIERS: SupplierDefinition[] = [
  {
    id: 'corner-wholesale',
    name: 'Corner Wholesale',
    origin: 'local',
    priceMultiplier: 1.0,
    reliability: 0.95,
    leadTimeDays: 1,
    description: 'Local, dependable, unremarkable pricing.',
  },
  {
    id: 'budget-freight',
    name: 'Budget Freight Co.',
    origin: 'imported',
    priceMultiplier: 0.78,
    reliability: 0.65,
    leadTimeDays: 4,
    description: 'Cheapest unit cost, but shipments are often late or short.',
  },
  {
    id: 'harborline-imports',
    name: 'Harborline Imports',
    origin: 'imported',
    priceMultiplier: 0.88,
    reliability: 0.8,
    leadTimeDays: 3,
    description: 'Solid discount for the wait, moderate reliability.',
  },
  {
    id: 'premier-distribution',
    name: 'Premier Distribution',
    origin: 'local',
    priceMultiplier: 1.15,
    reliability: 0.99,
    leadTimeDays: 1,
    description: 'Premium price for near-guaranteed, fast delivery.',
  },
  {
    id: 'graymarket-liquidators',
    name: 'Graymarket Liquidators',
    origin: 'imported',
    priceMultiplier: 0.6,
    reliability: 0.45,
    leadTimeDays: 6,
    description: 'Rock-bottom pricing, but deliveries are a coin flip and take forever.',
  },
  {
    id: 'boutique-atelier',
    name: 'Boutique Atelier Supply',
    origin: 'local',
    priceMultiplier: 1.35,
    reliability: 0.97,
    leadTimeDays: 2,
    description: 'Curated small-batch sourcing — expensive, reliable, and a reputation boost by association.',
  },
]

export const SUPPLIER_MAP: Record<string, SupplierDefinition> = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]))

/** The always-available fallback when no contract is signed: no lead time,
 * no disruption risk, but a markup versus any negotiated supplier price. */
export const RUSH_ORDER_MARKUP = 1.3
