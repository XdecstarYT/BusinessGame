import { create } from 'zustand'

const STARTING_SCORE = 70
const DAILY_PULL_TO_BASELINE = 0.05
const BASELINE = 70

interface ReputationState {
  score: number

  boostFromSale: () => void
  hitFromStockout: () => void
  hitFromLongQueue: () => void
  hitFromShareholderPressure: () => void
  decayDaily: () => void
  /** 0..1 factor combined with atmosphere to drive how often customers show up. */
  attractivenessFactor: () => number
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export const useReputation = create<ReputationState>((set, get) => ({
  score: STARTING_SCORE,

  boostFromSale: () => set((s) => ({ score: clamp(s.score + 0.15) })),
  hitFromStockout: () => set((s) => ({ score: clamp(s.score - 1.5) })),
  hitFromLongQueue: () => set((s) => ({ score: clamp(s.score - 0.8) })),
  /** A losing quarter once public draws public scrutiny — light-touch by
   * design, per the spec's no-hard-fail-state philosophy. */
  hitFromShareholderPressure: () => set((s) => ({ score: clamp(s.score - 2) })),

  decayDaily: () => set((s) => ({ score: clamp(s.score + (BASELINE - s.score) * DAILY_PULL_TO_BASELINE) })),

  attractivenessFactor: () => get().score / 100,
}))
