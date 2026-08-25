import { create } from 'zustand'
import { NEIGHBORHOODS } from '../data/neighborhoods'
import { PRODUCT_MAP } from '../data/products'
import { useCityMap } from './useCityMap'
import { useInventory } from './useInventory'
import {
  COMPETITOR_CHAINS,
  COMPETITOR_CHAIN_MAP,
  STRATEGY_PRICE_INDEX,
  STRATEGY_AGGRESSION,
  CONTESTED_ACQUISITION_MULTIPLIER,
  CITY_EVOLUTION_INTERVAL_DAYS,
  CITY_EVOLUTION_OPEN_CHANCE,
} from '../data/competitors'
import { reactiveDriftPriceIndex, isPriceWar } from '../systems/competitorSim'

/** Average of the player's active price overrides vs. each product's base
 * retail price — 1.0 means "pricing at MSRP", below 1.0 means undercutting.
 * Products with no override don't count toward it, so an empty store with
 * no manual pricing reads as neutral rather than as a price war. */
function computePlayerPriceIndex(): number {
  const overrides = useInventory.getState().priceOverrides
  const ids = Object.keys(overrides)
  if (ids.length === 0) return 1
  let sum = 0
  let count = 0
  for (const id of ids) {
    const product = PRODUCT_MAP[id]
    if (!product || product.retailPrice <= 0) continue
    sum += overrides[id] / product.retailPrice
    count++
  }
  return count > 0 ? sum / count : 1
}

export interface CompetitorPresence {
  plotId: string
  chainId: string
  priceIndex: number
}

interface CompetitorsState {
  presences: Record<string, CompetitorPresence>
  daysSinceCityEvolution: number
  events: string[]
  priceWarPlots: Record<string, boolean>

  isContested: (plotId: string) => boolean
  contestedAcquisitionCost: (baseCost: number, plotId: string) => number
  removeCompetitor: (plotId: string) => void
  competitorPressure: () => number
  /** 0-100 flavor gauge combining how many rivals are in the city, how
   * aggressive their strategies are, and how many are currently in an
   * active price war with the player — surfaced in the HUD/panels as a
   * single "how hot is the competition" readout. */
  rivalryScore: () => number
  tickDaily: () => void
}

const INITIAL_PRESENCES: Record<string, CompetitorPresence> = {
  suburbs: { plotId: 'suburbs', chainId: 'valumart', priceIndex: STRATEGY_PRICE_INDEX.discounter },
  uptown: { plotId: 'uptown', chainId: 'presticorp', priceIndex: STRATEGY_PRICE_INDEX.premium },
}

export const useCompetitors = create<CompetitorsState>((set, get) => ({
  presences: INITIAL_PRESENCES,
  daysSinceCityEvolution: 0,
  events: [],
  priceWarPlots: {},

  isContested: (plotId) => plotId in get().presences,

  contestedAcquisitionCost: (baseCost, plotId) => (get().isContested(plotId) ? Math.round(baseCost * CONTESTED_ACQUISITION_MULTIPLIER) : baseCost),

  removeCompetitor: (plotId) => {
    set((state) => {
      if (!(plotId in state.presences)) return state
      const presences = { ...state.presences }
      delete presences[plotId]
      const priceWarPlots = { ...state.priceWarPlots }
      delete priceWarPlots[plotId]
      return { presences, priceWarPlots }
    })
  },

  competitorPressure: () => {
    const presences = Object.values(get().presences)
    if (presences.length === 0) return 0
    let pressure = 0
    for (const presence of presences) {
      const chain = COMPETITOR_CHAIN_MAP[presence.chainId]
      if (!chain) continue
      pressure += STRATEGY_AGGRESSION[chain.strategy] * 0.03
    }
    return Math.min(0.3, pressure)
  },

  rivalryScore: () => {
    const state = get()
    const presences = Object.values(state.presences)
    if (presences.length === 0) return 0
    let score = 0
    for (const presence of presences) {
      const chain = COMPETITOR_CHAIN_MAP[presence.chainId]
      if (!chain) continue
      score += STRATEGY_AGGRESSION[chain.strategy] * 22
      if (state.priceWarPlots[presence.plotId]) score += 18
    }
    return Math.round(Math.min(100, score))
  },

  tickDaily: () => {
    const state = get()
    const playerPriceIndex = computePlayerPriceIndex()
    const presences: Record<string, CompetitorPresence> = {}
    const priceWarPlots: Record<string, boolean> = {}
    const warEvents: string[] = []

    for (const [plotId, presence] of Object.entries(state.presences)) {
      const chain = COMPETITOR_CHAIN_MAP[presence.chainId]
      if (!chain) {
        presences[plotId] = presence
        continue
      }
      const nextPriceIndex = reactiveDriftPriceIndex(presence.priceIndex, STRATEGY_PRICE_INDEX[chain.strategy], chain.strategy, playerPriceIndex)
      presences[plotId] = { ...presence, priceIndex: nextPriceIndex }

      const atWar = isPriceWar(nextPriceIndex, playerPriceIndex, chain.strategy)
      priceWarPlots[plotId] = atWar
      if (atWar && !state.priceWarPlots[plotId]) {
        const plot = NEIGHBORHOODS.find((p) => p.id === plotId)
        warEvents.push(`🔥 Price war: ${chain.name} slashed prices to compete with you in ${plot?.name ?? plotId}`)
      }
    }

    const daysSinceCityEvolution = state.daysSinceCityEvolution + 1
    let newEvents: string[] = warEvents
    let nextDaysSinceCityEvolution = daysSinceCityEvolution

    if (daysSinceCityEvolution >= CITY_EVOLUTION_INTERVAL_DAYS) {
      nextDaysSinceCityEvolution = 0
      const ownedPlotIds = useCityMap.getState().ownedPlotIds
      const candidates = NEIGHBORHOODS.filter((p) => !ownedPlotIds.includes(p.id) && !(p.id in presences))
      if (candidates.length > 0 && Math.random() < CITY_EVOLUTION_OPEN_CHANCE) {
        const plot = candidates[Math.floor(Math.random() * candidates.length)]
        const chain = COMPETITOR_CHAINS[Math.floor(Math.random() * COMPETITOR_CHAINS.length)]
        presences[plot.id] = { plotId: plot.id, chainId: chain.id, priceIndex: STRATEGY_PRICE_INDEX[chain.strategy] }
        newEvents = [`🏢 ${chain.name} just opened a location in ${plot.name}`, ...warEvents]
      }
    }

    set({
      presences,
      priceWarPlots,
      daysSinceCityEvolution: nextDaysSinceCityEvolution,
      events: newEvents.length > 0 ? [...newEvents, ...state.events].slice(0, 8) : state.events,
    })
  },
}))
