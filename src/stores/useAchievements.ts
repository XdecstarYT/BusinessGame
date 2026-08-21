import { create } from 'zustand'
import { useFinance } from './useFinance'
import { useStoreLayout } from './useStoreLayout'
import { useInventory } from './useInventory'
import { useCityMap } from './useCityMap'
import { useCorporateHQ } from './useCorporateHQ'
import { useCorporateFinance } from './useCorporateFinance'

interface AchievementsState {
  /** Achievement id -> the day it unlocked. */
  unlocked: Record<string, number>
  recentUnlocks: string[]

  checkAll: (day: number) => void
  dismissRecent: (id: string) => void
}

export const useAchievements = create<AchievementsState>((set, get) => ({
  unlocked: {},
  recentUnlocks: [],

  checkAll: (day) => {
    const state = get()
    const unlocked = { ...state.unlocked }
    const newlyUnlocked: string[] = []

    const markIfMet = (id: string, met: boolean) => {
      if (id in unlocked || !met) return
      unlocked[id] = day
      newlyUnlocked.push(id)
    }

    markIfMet('first-profitable-day', useFinance.getState().history.some((d) => d.profit > 0))

    const layout = useStoreLayout.getState()
    const shelfStock = useInventory.getState().shelfStock
    const shelves = Object.values(layout.fixtures).filter((f) => f.category === 'shelf')
    markIfMet('fully-stocked-store', shelves.length > 0 && shelves.every((f) => (shelfStock[f.id]?.quantity ?? 0) > 0))

    markIfMet('second-location', useCityMap.getState().ownedPlotIds.length > 1)
    markIfMet('first-franchise', useCorporateHQ.getState().franchiseeCount > 0)
    markIfMet('public-offering', useCorporateFinance.getState().isPublic)

    if (newlyUnlocked.length > 0) {
      set({ unlocked, recentUnlocks: [...state.recentUnlocks, ...newlyUnlocked] })
    }
  },

  dismissRecent: (id) => set((s) => ({ recentUnlocks: s.recentUnlocks.filter((r) => r !== id) })),
}))
