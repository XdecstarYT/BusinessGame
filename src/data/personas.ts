export type PersonaId = 'budget' | 'loyalist' | 'impulse' | 'family'

export interface PersonaDefinition {
  id: PersonaId
  label: string
  icon: string
  wantCountMin: number
  wantCountMax: number
  /** Multiplier on shelf browsing dwell time — family shoppers deliberate longer,
   * impulse buyers grab and go. */
  dwellMultiplier: number
  /** 0..1 — how strongly this persona weights cheaper products when several
   * shelf candidates are available. 0 = ignores price entirely. */
  priceSensitivity: number
}

export const PERSONAS: Record<PersonaId, PersonaDefinition> = {
  budget: {
    id: 'budget',
    label: 'Budget Shopper',
    icon: '💰',
    wantCountMin: 2,
    wantCountMax: 4,
    dwellMultiplier: 0.9,
    priceSensitivity: 0.9,
  },
  loyalist: {
    id: 'loyalist',
    label: 'Brand Loyalist',
    icon: '⭐',
    wantCountMin: 1,
    wantCountMax: 3,
    dwellMultiplier: 0.8,
    priceSensitivity: 0.15,
  },
  impulse: {
    id: 'impulse',
    label: 'Impulse Buyer',
    icon: '⚡',
    wantCountMin: 2,
    wantCountMax: 5,
    dwellMultiplier: 0.6,
    priceSensitivity: 0.05,
  },
  family: {
    id: 'family',
    label: 'Family Shopper',
    icon: '👪',
    wantCountMin: 3,
    wantCountMax: 6,
    dwellMultiplier: 1.3,
    priceSensitivity: 0.45,
  },
}

const PERSONA_IDS = Object.keys(PERSONAS) as PersonaId[]

export function randomPersona(): PersonaId {
  return PERSONA_IDS[Math.floor(Math.random() * PERSONA_IDS.length)]
}

export function randomWantCountFor(persona: PersonaId): number {
  const def = PERSONAS[persona]
  return def.wantCountMin + Math.floor(Math.random() * (def.wantCountMax - def.wantCountMin + 1))
}
