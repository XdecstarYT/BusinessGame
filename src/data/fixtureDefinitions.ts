export type FixtureCategory = 'shelf' | 'checkout' | 'stairs'

export interface FixtureDefinition {
  category: FixtureCategory
  label: string
  footprint: { width: number; depth: number }
  height: number
  cost: number
  color: string
}

export const FIXTURE_DEFINITIONS: Record<FixtureCategory, FixtureDefinition> = {
  shelf: {
    category: 'shelf',
    label: 'Shelf',
    footprint: { width: 1, depth: 1 },
    height: 1.4,
    cost: 120,
    color: '#8a6d3b',
  },
  checkout: {
    category: 'checkout',
    label: 'Checkout Counter',
    footprint: { width: 1, depth: 1 },
    height: 1.1,
    cost: 450,
    color: '#3b6d8a',
  },
  stairs: {
    category: 'stairs',
    label: 'Stairs',
    footprint: { width: 1, depth: 1 },
    height: 3,
    cost: 300,
    color: '#6b5b4a',
  },
}

export const FLOOR_COST = 25
export const WALL_COST = 60
