import { create } from 'zustand'
import { useFinance } from './useFinance'
import { useReputation } from './useReputation'
import {
  LOAN_OFFERS,
  STARTING_CREDIT_SCORE,
  CREDIT_SCORE_ON_TIME_PAYMENT,
  CREDIT_SCORE_MISSED_PAYMENT,
  INSURANCE_DAILY_PREMIUM,
  FUNDING_ROUNDS,
  IPO_VALUATION_THRESHOLD,
  IPO_PROCEEDS_FRACTION,
  QUARTER_DAYS,
} from '../data/finance'
import { computeValuation, loanDailyPayment, loanTotalRepayment } from '../systems/corporateFinance'

export interface ActiveLoan {
  offerId: string
  label: string
  dailyPayment: number
  remaining: number
}

export interface QuarterlyReport {
  quarterEndDay: number
  revenue: number
  profit: number
}

interface CorporateFinanceState {
  creditScore: number
  activeLoan: ActiveLoan | null
  insuranceActive: boolean
  fundingRoundsTaken: string[]
  isPublic: boolean
  events: string[]
  quarterlyReports: QuarterlyReport[]
  daysSinceLastQuarter: number

  takeLoan: (offerId: string) => boolean
  toggleInsurance: () => void
  launchFundingRound: (roundId: string) => boolean
  launchIPO: () => boolean
  currentValuation: () => number
  tickDaily: (day: number) => void
}

function pushEvent(events: string[], message: string): string[] {
  return [message, ...events].slice(0, 8)
}

export const useCorporateFinance = create<CorporateFinanceState>((set, get) => ({
  creditScore: STARTING_CREDIT_SCORE,
  activeLoan: null,
  insuranceActive: false,
  fundingRoundsTaken: [],
  isPublic: false,
  events: [],
  quarterlyReports: [],
  daysSinceLastQuarter: 0,

  takeLoan: (offerId) => {
    const state = get()
    if (state.activeLoan) return false
    const offer = LOAN_OFFERS.find((o) => o.id === offerId)
    if (!offer || state.creditScore < offer.minCreditScore) return false

    useFinance.getState().addCash(offer.principal)
    set({
      activeLoan: {
        offerId: offer.id,
        label: offer.label,
        dailyPayment: loanDailyPayment(offer.principal, offer.dailyRate, offer.termDays),
        remaining: loanTotalRepayment(offer.principal, offer.dailyRate, offer.termDays),
      },
      events: pushEvent(state.events, `💵 Took out a ${offer.label} — $${offer.principal.toLocaleString()} disbursed`),
    })
    return true
  },

  toggleInsurance: () => set((s) => ({ insuranceActive: !s.insuranceActive })),

  launchFundingRound: (roundId) => {
    const state = get()
    if (state.fundingRoundsTaken.includes(roundId)) return false
    const round = FUNDING_ROUNDS.find((r) => r.id === roundId)
    if (!round) return false
    const valuation = state.currentValuation()
    if (valuation < round.minValuation) return false

    const cashRaised = valuation * round.valuationFraction
    useFinance.getState().addCash(cashRaised)
    set({
      fundingRoundsTaken: [...state.fundingRoundsTaken, roundId],
      events: pushEvent(
        state.events,
        `🤝 ${round.label} closed — $${Math.round(cashRaised).toLocaleString()} raised for ${round.equityPercent}% equity`,
      ),
    })
    return true
  },

  launchIPO: () => {
    const state = get()
    if (state.isPublic) return false
    const valuation = state.currentValuation()
    if (valuation < IPO_VALUATION_THRESHOLD) return false

    const proceeds = valuation * IPO_PROCEEDS_FRACTION
    useFinance.getState().addCash(proceeds)
    set({
      isPublic: true,
      events: pushEvent(state.events, `🔔 Went public! Raised $${Math.round(proceeds).toLocaleString()} in the IPO`),
    })
    return true
  },

  currentValuation: () => {
    const trailingProfit = useFinance.getState().history.reduce((sum, d) => sum + d.profit, 0)
    return computeValuation(useFinance.getState().cash, trailingProfit, useReputation.getState().score)
  },

  tickDaily: (day) => {
    const state = get()
    let { creditScore, activeLoan, insuranceActive, events, daysSinceLastQuarter, quarterlyReports } = state

    if (activeLoan) {
      const payment = Math.min(activeLoan.dailyPayment, activeLoan.remaining)
      if (useFinance.getState().spend(payment)) {
        const remaining = activeLoan.remaining - payment
        creditScore = Math.min(100, creditScore + CREDIT_SCORE_ON_TIME_PAYMENT)
        if (remaining <= 0.01) {
          events = pushEvent(events, `🎉 ${activeLoan.label} paid off in full`)
          activeLoan = null
        } else {
          activeLoan = { ...activeLoan, remaining }
        }
      } else {
        creditScore = Math.max(0, creditScore + CREDIT_SCORE_MISSED_PAYMENT)
        events = pushEvent(events, `⚠️ Missed a loan payment — credit score took a hit`)
      }
    }

    if (insuranceActive) {
      if (!useFinance.getState().spend(INSURANCE_DAILY_PREMIUM)) {
        insuranceActive = false
        events = pushEvent(events, `📉 Insurance lapsed — couldn't cover the premium`)
      }
    }

    daysSinceLastQuarter += 1
    if (daysSinceLastQuarter >= QUARTER_DAYS) {
      const trailing = useFinance.getState().history.slice(-QUARTER_DAYS)
      const revenue = trailing.reduce((sum, d) => sum + d.revenue, 0)
      const profit = trailing.reduce((sum, d) => sum + d.profit, 0)
      quarterlyReports = [{ quarterEndDay: day, revenue, profit }, ...quarterlyReports].slice(0, 8)
      events = pushEvent(events, `📊 Quarterly earnings: $${Math.round(revenue).toLocaleString()} revenue, $${Math.round(profit).toLocaleString()} profit`)
      if (state.isPublic && profit < 0) {
        useReputation.getState().hitFromShareholderPressure()
        events = pushEvent(events, `📉 Shareholders unhappy with a losing quarter — reputation dinged`)
      }
      daysSinceLastQuarter = 0
    }

    set({ creditScore, activeLoan, insuranceActive, events, daysSinceLastQuarter, quarterlyReports })
  },
}))
