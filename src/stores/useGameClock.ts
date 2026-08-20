import { create } from 'zustand'
import { useFinance } from './useFinance'
import { useCustomers } from './useCustomers'

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
      useFinance.getState().endDay(day)
      useCustomers.getState().resetDaily()
      day += 1
    }

    set({ day, dayProgress: progress })
  },
}))

/** Cosmetic 8am–10pm store-hours clock derived from day progress. */
export function formatClock(dayProgress: number): string {
  const hour = 8 + dayProgress * 14
  const h = Math.floor(hour)
  const m = Math.floor((hour - h) * 60)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = ((h + 11) % 12) + 1
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
}
