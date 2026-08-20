import { create } from 'zustand'
import { computeDaySummary, type DaySummary } from '../systems/financeTick'

const STARTING_CASH = 5000
export const DAILY_RENT = 75
const MAX_HISTORY_DAYS = 30

interface FinanceState {
  cash: number
  dailyRevenue: number
  dailyCogs: number
  history: DaySummary[]

  spend: (amount: number) => boolean
  recordSale: (revenue: number, cogs: number) => void
  endDay: (day: number) => void
}

export const useFinance = create<FinanceState>((set, get) => ({
  cash: STARTING_CASH,
  dailyRevenue: 0,
  dailyCogs: 0,
  history: [],

  spend: (amount) => {
    const state = get()
    if (amount <= 0 || state.cash < amount) return false
    set({ cash: state.cash - amount })
    return true
  },

  recordSale: (revenue, cogs) => {
    const state = get()
    set({
      cash: state.cash + revenue,
      dailyRevenue: state.dailyRevenue + revenue,
      dailyCogs: state.dailyCogs + cogs,
    })
  },

  endDay: (day) => {
    const state = get()
    const summary = computeDaySummary(day, state.dailyRevenue, state.dailyCogs, DAILY_RENT)
    set({
      cash: state.cash - DAILY_RENT,
      dailyRevenue: 0,
      dailyCogs: 0,
      history: [...state.history, summary].slice(-MAX_HISTORY_DAYS),
    })
  },
}))
