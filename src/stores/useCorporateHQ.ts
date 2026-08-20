import { create } from 'zustand'
import { NEIGHBORHOODS } from '../data/neighborhoods'
import { useCityMap, HOME_PLOT_ID } from './useCityMap'
import { useReputation } from './useReputation'
import { useInventory } from './useInventory'
import { useFinance } from './useFinance'
import {
  brandConsistencyFactor,
  computeLocationDailyResult,
  DEFAULT_MANAGER_QUALITY,
  MANAGER_QUALITY_STEP,
  MANAGER_QUALITY_UPGRADE_COST,
  MAX_MANAGER_QUALITY,
} from '../systems/corporateHQ'
import { FRANCHISE_UNLOCK_REPUTATION, MAX_FRANCHISEES, FRANCHISEE_LICENSE_COST, FRANCHISEE_DAILY_ROYALTY } from '../data/franchise'

export interface ChainLocation {
  plotId: string
  managerQuality: number
  lastDailyProfit: number
  totalProfit: number
}

interface CorporateHQState {
  /** Keyed by plotId — every City Map plot owned beyond the home store. */
  locations: Record<string, ChainLocation>
  franchiseeCount: number
  events: string[]

  upgradeManager: (plotId: string) => boolean
  franchiseUnlocked: () => boolean
  licenseFranchisee: () => boolean
  tickDaily: () => void
  chainWideDailyProfit: () => number
}

export const useCorporateHQ = create<CorporateHQState>((set, get) => ({
  locations: {},
  franchiseeCount: 0,
  events: [],

  franchiseUnlocked: () => useReputation.getState().score >= FRANCHISE_UNLOCK_REPUTATION,

  licenseFranchisee: () => {
    const state = get()
    if (!state.franchiseUnlocked() || state.franchiseeCount >= MAX_FRANCHISEES) return false
    if (!useFinance.getState().spend(FRANCHISEE_LICENSE_COST)) return false
    set((s) => ({
      franchiseeCount: s.franchiseeCount + 1,
      events: [`🤝 Licensed a new franchisee — $${FRANCHISEE_DAILY_ROYALTY}/day in royalties`, ...s.events].slice(0, 8),
    }))
    return true
  },

  upgradeManager: (plotId) => {
    const location = get().locations[plotId]
    if (!location || location.managerQuality >= MAX_MANAGER_QUALITY) return false
    if (!useFinance.getState().spend(MANAGER_QUALITY_UPGRADE_COST)) return false
    set((state) => ({
      locations: {
        ...state.locations,
        [plotId]: { ...location, managerQuality: Math.min(MAX_MANAGER_QUALITY, location.managerQuality + MANAGER_QUALITY_STEP) },
      },
    }))
    return true
  },

  tickDaily: () => {
    const state = get()
    const ownedPlotIds = useCityMap.getState().ownedPlotIds.filter((id) => id !== HOME_PLOT_ID)
    const locations = { ...state.locations }
    const newEvents: string[] = []

    for (const plotId of ownedPlotIds) {
      if (locations[plotId]) continue
      const plot = NEIGHBORHOODS.find((p) => p.id === plotId)
      locations[plotId] = { plotId, managerQuality: DEFAULT_MANAGER_QUALITY, lastDailyProfit: 0, totalProfit: 0 }
      if (plot) newEvents.push(`🏬 ${plot.name} is now part of your chain, run by an on-site manager`)
    }
    for (const plotId of Object.keys(locations)) {
      if (!ownedPlotIds.includes(plotId)) delete locations[plotId]
    }

    const brandFactor = brandConsistencyFactor(useReputation.getState().score)
    const hasWarehouseBonus = useInventory.getState().warehouseTier > 0
    let chainProfitToday = 0

    for (const plotId of Object.keys(locations)) {
      const plot = NEIGHBORHOODS.find((p) => p.id === plotId)
      if (!plot) continue
      const location = locations[plotId]
      const result = computeLocationDailyResult(plot.footTraffic, plot.acquisitionCost, location.managerQuality, brandFactor, hasWarehouseBonus)
      locations[plotId] = { ...location, lastDailyProfit: result.profit, totalProfit: location.totalProfit + result.profit }
      chainProfitToday += result.profit
    }

    const royaltyToday = state.franchiseeCount * FRANCHISEE_DAILY_ROYALTY
    const totalToday = chainProfitToday + royaltyToday
    if (totalToday !== 0) {
      useFinance.getState().applyOperatingResult(totalToday)
    }

    set({
      locations,
      events: newEvents.length > 0 ? [...newEvents, ...state.events].slice(0, 8) : state.events,
    })
  },

  chainWideDailyProfit: () => {
    const state = get()
    const locationsProfit = Object.values(state.locations).reduce((sum, l) => sum + l.lastDailyProfit, 0)
    return locationsProfit + state.franchiseeCount * FRANCHISEE_DAILY_ROYALTY
  },
}))
