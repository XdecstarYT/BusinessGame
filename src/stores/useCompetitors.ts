import { create } from 'zustand'
import { NEIGHBORHOODS } from '../data/neighborhoods'
import { useCityMap } from './useCityMap'
import {
  COMPETITOR_CHAINS,
  COMPETITOR_CHAIN_MAP,
  STRATEGY_PRICE_INDEX,
  STRATEGY_AGGRESSION,
  CONTESTED_ACQUISITION_MULTIPLIER,
  CITY_EVOLUTION_INTERVAL_DAYS,
  CITY_EVOLUTION_OPEN_CHANCE,
} from '../data/competitors'
import { driftPriceIndex } from '../systems/competitorSim'

export interface CompetitorPresence {
  plotId: string
  chainId: string
  priceIndex: number
}

interface CompetitorsState {
  presences: Record<string, CompetitorPresence>
  daysSinceCityEvolution: number
  events: string[]

  isContested: (plotId: string) => boolean
  contestedAcquisitionCost: (baseCost: number, plotId: string) => number
  removeCompetitor: (plotId: string) => void
  competitorPressure: () => number
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

  isContested: (plotId) => plotId in get().presences,

  contestedAcquisitionCost: (baseCost, plotId) => (get().isContested(plotId) ? Math.round(baseCost * CONTESTED_ACQUISITION_MULTIPLIER) : baseCost),

  removeCompetitor: (plotId) => {
    set((state) => {
      if (!(plotId in state.presences)) return state
      const presences = { ...state.presences }
      delete presences[plotId]
      return { presences }
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

  tickDaily: () => {
    const state = get()
    const presences: Record<string, CompetitorPresence> = {}
    for (const [plotId, presence] of Object.entries(state.presences)) {
      const chain = COMPETITOR_CHAIN_MAP[presence.chainId]
      if (!chain) {
        presences[plotId] = presence
        continue
      }
      presences[plotId] = {
        ...presence,
        priceIndex: driftPriceIndex(presence.priceIndex, STRATEGY_PRICE_INDEX[chain.strategy], chain.strategy),
      }
    }

    const daysSinceCityEvolution = state.daysSinceCityEvolution + 1
    let newEvents: string[] = []
    let nextDaysSinceCityEvolution = daysSinceCityEvolution

    if (daysSinceCityEvolution >= CITY_EVOLUTION_INTERVAL_DAYS) {
      nextDaysSinceCityEvolution = 0
      const ownedPlotIds = useCityMap.getState().ownedPlotIds
      const candidates = NEIGHBORHOODS.filter((p) => !ownedPlotIds.includes(p.id) && !(p.id in presences))
      if (candidates.length > 0 && Math.random() < CITY_EVOLUTION_OPEN_CHANCE) {
        const plot = candidates[Math.floor(Math.random() * candidates.length)]
        const chain = COMPETITOR_CHAINS[Math.floor(Math.random() * COMPETITOR_CHAINS.length)]
        presences[plot.id] = { plotId: plot.id, chainId: chain.id, priceIndex: STRATEGY_PRICE_INDEX[chain.strategy] }
        newEvents = [`🏢 ${chain.name} just opened a location in ${plot.name}`]
      }
    }

    set({
      presences,
      daysSinceCityEvolution: nextDaysSinceCityEvolution,
      events: newEvents.length > 0 ? [...newEvents, ...state.events].slice(0, 8) : state.events,
    })
  },
}))
