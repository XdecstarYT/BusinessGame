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
import { useCorporateHQ } from './useCorporateHQ'
import { useCompetitors } from './useCompetitors'
import { useEvents } from './useEvents'
import { useAchievements } from './useAchievements'
import { useWeather } from './useWeather'
import { useLoyalty } from './useLoyalty'
import { useComplaints } from './useComplaints'
import { useGoals } from './useGoals'
import { useDayReport } from './useDayReport'
import type { StaffRole } from '../data/staffDefinitions'

export const DAY_LENGTH_SECONDS = 120

interface GameClockState {
  day: number
  dayProgress: number
  advance: (deltaSeconds: number) => void
  /** Settles the day that's in progress immediately (used by a manual "End
   * Day" action) instead of waiting for dayProgress to reach 1 naturally —
   * runs the exact same rollover so finance/staff/report stay consistent
   * whether the day ends on its own or gets cut short. */
  forceRollover: () => void
}

/** Runs every end-of-day system tick (finance settlement, staff drift,
 * atmosphere/reputation decay, supply chain, competitors, events,
 * achievements, weather, loyalty, weekly goals) and publishes the day-end
 * report. Returns the new day number. Shared by both the natural rollover
 * inside `advance` and the manual `forceRollover`. */
function runRollover(day: number): number {
  const layout = useStoreLayout.getState()
  const shelfStock = useInventory.getState().shelfStock
  const relevantCounts: Record<StaffRole, number> = {
    stocker: Object.values(layout.fixtures).filter((f) => f.category === 'shelf' && shelfStock[f.id]?.productId).length,
    cashier: Object.values(layout.fixtures).filter((f) => f.category === 'checkout').length,
    janitor: Object.keys(layout.floors).length,
    security: Object.keys(layout.floors).length,
    manager: Object.keys(layout.fixtures).length,
  }

  // Snapshot today's numbers before the resets below clear them out.
  const servedToday = useCustomers.getState().servedToday
  const bestSaleToday = useCustomers.getState().bestSaleToday
  const complaintsToday = useComplaints.getState().countToday
  const weatherToday = useWeather.getState().current
  const reputationBeforeDecay = useReputation.getState().score
  const dailyRevenue = useFinance.getState().dailyRevenue
  const dailyCogs = useFinance.getState().dailyCogs
  const dailyShrinkage = useFinance.getState().dailyShrinkage
  const dailyMarketing = useFinance.getState().dailyMarketing

  useFinance.getState().endDay(day, useStaff.getState().totalDailyPayroll())
  const cashAfter = useFinance.getState().cash
  useStaff.getState().applyDailyDrift(relevantCounts)
  useStoreAtmosphere.getState().decayDaily()
  useReputation.getState().decayDaily()
  useMarketing.getState().tickDaily()
  useCustomers.getState().resetDaily()
  useComplaints.getState().resetDaily()

  const summary = useFinance.getState().history.at(-1)

  day += 1
  useSupplyChain.getState().tickDailyDeliveries(day)
  useSupplyChain.getState().tickManagerAutoReorder(day)
  useCorporateFinance.getState().tickDaily(day)
  useCorporateHQ.getState().tickDaily()
  useCompetitors.getState().tickDaily()
  useEvents.getState().tickDaily(day)
  useWeather.getState().tickDaily(day)
  useLoyalty.getState().tickDaily(servedToday)
  useGoals.getState().tickDaily(servedToday, summary?.profit ?? 0, reputationBeforeDecay)
  useAchievements.getState().checkAll(day)

  if (summary) {
    useDayReport.getState().publish({
      day: summary.day,
      revenue: dailyRevenue,
      cogs: dailyCogs,
      grossProfit: dailyRevenue - dailyCogs,
      rent: summary.rent,
      payroll: summary.payroll,
      shrinkage: dailyShrinkage,
      marketing: dailyMarketing,
      taxes: summary.taxes,
      netProfit: summary.profit,
      customersServed: servedToday,
      complaints: complaintsToday,
      weather: weatherToday,
      bestSale: bestSaleToday,
      cashAfter,
    })
  }

  return day
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
      day = runRollover(day)
    }

    set({ day, dayProgress: progress })
  },

  forceRollover: () => {
    const day = runRollover(get().day)
    set({ day, dayProgress: 0 })
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
