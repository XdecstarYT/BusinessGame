import { STOCKROOM_CAPACITY } from './products'

export interface WarehouseTierDefinition {
  tier: number
  label: string
  capacity: number
  upgradeCost: number
  description: string
}

export const WAREHOUSE_TIERS: WarehouseTierDefinition[] = [
  { tier: 0, label: 'Backroom Stockroom', capacity: STOCKROOM_CAPACITY, upgradeCost: 0, description: 'The stockroom you started with.' },
  { tier: 1, label: 'Small Warehouse', capacity: 800, upgradeCost: 6000, description: 'Doubles stockroom capacity.' },
  { tier: 2, label: 'Distribution Warehouse', capacity: 1600, upgradeCost: 18000, description: 'Room for real bulk buying.' },
]

export function capacityForTier(tier: number): number {
  const clamped = Math.max(0, Math.min(tier, WAREHOUSE_TIERS.length - 1))
  return WAREHOUSE_TIERS[clamped].capacity
}
