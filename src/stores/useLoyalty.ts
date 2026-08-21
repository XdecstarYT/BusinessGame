import { create } from 'zustand'
import { useFinance } from './useFinance'

export const LOYALTY_LAUNCH_COST = 800
const MAX_MEMBERS = 500
/** Members enrolled per customer served once the program is running —
 * intentionally slow so it reads as a long-term investment. */
const ENROLLMENT_RATE = 0.35
/** Demand multiplier contributed at the membership cap. */
const MAX_DEMAND_BOOST = 0.2

interface LoyaltyState {
  active: boolean
  membersEnrolled: number

  launchProgram: () => boolean
  tickDaily: (customersServedToday: number) => void
  demandBoost: () => number
}

export const useLoyalty = create<LoyaltyState>((set, get) => ({
  active: false,
  membersEnrolled: 0,

  launchProgram: () => {
    if (get().active) return false
    if (!useFinance.getState().spend(LOYALTY_LAUNCH_COST)) return false
    set({ active: true })
    return true
  },

  tickDaily: (customersServedToday) => {
    const state = get()
    if (!state.active) return
    const enrolled = Math.min(MAX_MEMBERS, state.membersEnrolled + Math.round(customersServedToday * ENROLLMENT_RATE))
    if (enrolled !== state.membersEnrolled) set({ membersEnrolled: enrolled })
  },

  demandBoost: () => {
    const state = get()
    if (!state.active) return 0
    return (state.membersEnrolled / MAX_MEMBERS) * MAX_DEMAND_BOOST
  },
}))
