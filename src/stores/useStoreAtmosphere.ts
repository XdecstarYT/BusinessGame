import { create } from 'zustand'

export type LightingMood = 'bright' | 'neutral' | 'warm' | 'dim'

export interface LightingMoodDefinition {
  label: string
  color: string
  intensity: number
  ambient: number
  /** How pleasant this mood is for lingering shoppers, 0..1. */
  comfort: number
}

export const LIGHTING_MOODS: Record<LightingMood, LightingMoodDefinition> = {
  bright: { label: 'Bright', color: '#ffffff', intensity: 1.5, ambient: 0.75, comfort: 0.7 },
  neutral: { label: 'Neutral', color: '#fff4e0', intensity: 1.3, ambient: 0.6, comfort: 0.85 },
  warm: { label: 'Warm', color: '#ffd9a0', intensity: 1.1, ambient: 0.55, comfort: 1.0 },
  dim: { label: 'Dim', color: '#ffc98a', intensity: 0.7, ambient: 0.35, comfort: 0.5 },
}

const SALE_DIRT = 1.5
const DAILY_DECAY = 5

interface AtmosphereState {
  cleanliness: number
  lightingMood: LightingMood

  setLightingMood: (mood: LightingMood) => void
  dirtyFromSale: () => void
  cleanBy: (amount: number) => void
  decayDaily: () => void
  /** Combined 0..1 "is this store pleasant to shop in" score, used to nudge
   * how often customers show up. */
  atmosphereScore: () => number
}

export const useStoreAtmosphere = create<AtmosphereState>((set, get) => ({
  cleanliness: 100,
  lightingMood: 'neutral',

  setLightingMood: (lightingMood) => set({ lightingMood }),

  dirtyFromSale: () => set((state) => ({ cleanliness: Math.max(0, state.cleanliness - SALE_DIRT) })),

  cleanBy: (amount) => set((state) => ({ cleanliness: Math.min(100, state.cleanliness + amount) })),

  decayDaily: () => set((state) => ({ cleanliness: Math.max(0, state.cleanliness - DAILY_DECAY) })),

  atmosphereScore: () => {
    const state = get()
    const comfort = LIGHTING_MOODS[state.lightingMood].comfort
    return state.cleanliness / 100 * 0.5 + comfort * 0.5
  },
}))
