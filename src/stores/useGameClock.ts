import { create } from 'zustand'
import { useFinance } from './useFinance'
import { useCustomers } from './useCustomers'
import { useStaff } from './useStaff'
import { useStoreAtmosphere } from './useStoreAtmosphere'
import { useReputation } from './useReputation'
import { useMarketing } from './useMarketing'
import { useStoreLayout } from './useStoreLayout'
import { useInventory } from './useInventory'
import { useSupplyChain } from './useSupplyChain'
import { useCorporateFinance } from './useCorporateFinance'
import type { StaffRole } from '../data/staffDefinitions'

export const DAY_LENGTH_SECONDS = 120

interface GameClockState {
  day: number
  dayProgress: number
  advance: (deltaSeconds: number) => void
}

export const useGameClock = create<GameClockState>((set, get) => ({
  day: 1,
  dayProgress: 0,

  advance: (deltaSeconds) => {
    const state = get()
    let progress = state.dayProgress + deltaSeconds / DAY_LENGTH_SECONDS
    let day = state.day

    if (progress >= 1) {
      progress -= 1

      const layout = useStoreLayout.getState()
      const shelfStock = useInventory.getState().shelfStock
      const relevantCounts: Record<StaffRole, number> = {
        stocker: Object.values(layout.fixtures).filter((f) => f.category === 'shelf' && shelfStock[f.id]?.productId).length,
        cashier: Object.values(layout.fixtures).filter((f) => f.category === 'checkout').length,
        janitor: Object.keys(layout.floors).length,
        security: Object.keys(layout.floors).length,
      }

      useFinance.getState().endDay(day, useStaff.getState().totalDailyPayroll())
      useStaff.getState().applyDailyDrift(relevantCounts)
      useStoreAtmosphere.getState().decayDaily()
      useReputation.getState().decayDaily()
      useMarketing.getState().tickDaily()
      useCustomers.getState().resetDaily()
      day += 1
      useSupplyChain.getState().tickDailyDeliveries(day)
      useCorporateFinance.getState().tickDaily(day)
    }

    set({ day, dayProgress: progress })
  },
}))

/** Cosmetic 8am–10pm store-hours window, mapped from day progress (0..1). */
export function dayProgressToHour(dayProgress: number): number {
  return 8 + dayProgress * 14
}

export function currentGameHour(): number {
  return dayProgressToHour(useGameClock.getState().dayProgress)
}

export function formatClock(dayProgress: number): string {
  const hour = dayProgressToHour(dayProgress)
  const h = Math.floor(hour)
  const m = Math.floor((hour - h) * 60)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = ((h + 11) % 12) + 1
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
}
