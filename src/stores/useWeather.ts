import { create } from 'zustand'
import { seasonForDay } from '../systems/calendar'
import type { Season } from '../data/calendar'

export type WeatherKind = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'

export interface WeatherDefinition {
  label: string
  icon: string
  /** Multiplier applied to customer spawn rate while this weather holds. */
  demandMultiplier: number
}

export const WEATHER_DEFINITIONS: Record<WeatherKind, WeatherDefinition> = {
  sunny: { label: 'Sunny', icon: '☀️', demandMultiplier: 1.1 },
  cloudy: { label: 'Cloudy', icon: '☁️', demandMultiplier: 1.0 },
  rainy: { label: 'Rainy', icon: '🌧️', demandMultiplier: 0.85 },
  stormy: { label: 'Stormy', icon: '⛈️', demandMultiplier: 0.65 },
  snowy: { label: 'Snowy', icon: '❄️', demandMultiplier: 0.8 },
}

/** Season-weighted odds for each weather kind — snow only shows up in
 * winter, storms lean toward summer, etc. Weights don't need to sum to 1. */
const SEASON_WEIGHTS: Record<Season, Partial<Record<WeatherKind, number>>> = {
  spring: { sunny: 3, cloudy: 3, rainy: 4, stormy: 1 },
  summer: { sunny: 5, cloudy: 2, rainy: 1, stormy: 2 },
  fall: { sunny: 2, cloudy: 4, rainy: 3, stormy: 1 },
  winter: { sunny: 2, cloudy: 3, snowy: 4, stormy: 1 },
}

/** Chance the weather just holds steady from yesterday, for continuity
 * rather than a new roll every single day. */
const PERSISTENCE_CHANCE = 0.55

function rollWeather(day: number): WeatherKind {
  const weights = SEASON_WEIGHTS[seasonForDay(day)]
  const entries = Object.entries(weights) as [WeatherKind, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = Math.random() * total
  for (const [kind, weight] of entries) {
    roll -= weight
    if (roll <= 0) return kind
  }
  return entries[0][0]
}

interface WeatherState {
  current: WeatherKind
  events: string[]

  tickDaily: (day: number) => void
  demandMultiplier: () => number
}

export const useWeather = create<WeatherState>((set, get) => ({
  current: 'sunny',
  events: [],

  tickDaily: (day) => {
    const state = get()
    const keepCurrent = Math.random() < PERSISTENCE_CHANCE
    const next = keepCurrent ? state.current : rollWeather(day)
    if (next === state.current) return
    const def = WEATHER_DEFINITIONS[next]
    set({
      current: next,
      events: [`${def.icon} Weather turning ${def.label.toLowerCase()} today`, ...state.events].slice(0, 8),
    })
  },

  demandMultiplier: () => WEATHER_DEFINITIONS[get().current].demandMultiplier,
}))
