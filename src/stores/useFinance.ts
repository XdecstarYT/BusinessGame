import { create } from 'zustand'
import { computeDaySummary, type DaySummary } from '../systems/financeTick'

const STARTING_CASH = 5000
export const DAILY_RENT = 75
const MAX_HISTORY_DAYS = 30

interface FinanceState {
  cash: number
  dailyRevenue: number
  dailyCogs: number
  dailyShrinkage: number
  dailyMarketing: number
  history: DaySummary[]

  spend: (amount: number) => boolean
  recordSale: (revenue: number, cogs: number) => void
  recordShrinkage: (cost: number) => void
  recordMarketingSpend: (amount: number) => void
  endDay: (day: number, payroll: number) => void
}

export const useFinance = create<FinanceState>((set, get) => ({
  cash: STARTING_CASH,
  dailyRevenue: 0,
  dailyCogs: 0,
  dailyShrinkage: 0,
  dailyMarketing: 0,
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

  recordShrinkage: (cost) => {
    const state = get()
    set({ dailyShrinkage: state.dailyShrinkage + cost })
  },

  recordMarketingSpend: (amount) => {
    const state = get()
    set({ dailyMarketing: state.dailyMarketing + amount })
  },

  endDay: (day, payroll) => {
    const state = get()
    const summary = computeDaySummary({
      day,
      revenue: state.dailyRevenue,
      cogs: state.dailyCogs,
      rent: DAILY_RENT,
      payroll,
      shrinkage: state.dailyShrinkage,
      marketing: state.dailyMarketing,
    })
    set({
      cash: state.cash - DAILY_RENT - payroll,
      dailyRevenue: 0,
      dailyCogs: 0,
      dailyShrinkage: 0,
      dailyMarketing: 0,
      history: [...state.history, summary].slice(-MAX_HISTORY_DAYS),
    })
  },
}))
