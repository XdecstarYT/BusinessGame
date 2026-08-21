import { create } from 'zustand'
import type { WeatherKind } from './useWeather'

export interface DayEndReport {
  day: number
  revenue: number
  cogs: number
  grossProfit: number
  rent: number
  payroll: number
  shrinkage: number
  marketing: number
  taxes: number
  netProfit: number
  customersServed: number
  complaints: number
  weather: WeatherKind
  bestSale: { label: string; amount: number } | null
  cashAfter: number
}

interface DayReportState {
  report: DayEndReport | null
  visible: boolean

  publish: (report: DayEndReport) => void
  dismiss: () => void
}

/** Snapshot of "how did today go", published once per day-rollover (auto or
 * manual) and shown as a modal right as Play hands back to Build phase. */
export const useDayReport = create<DayReportState>((set) => ({
  report: null,
  visible: false,

  publish: (report) => set({ report, visible: true }),
  dismiss: () => set({ visible: false }),
}))
