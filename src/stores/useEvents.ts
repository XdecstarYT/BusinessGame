import { create } from 'zustand'
import { EVENT_IDS, EVENT_MIN_GAP_DAYS, EVENT_DAILY_CHANCE, type EventId } from '../data/events'
import { resolveEvent } from '../systems/eventsEngine'
import { PRODUCT_MAP } from '../data/products'
import { useFinance } from './useFinance'
import { useReputation } from './useReputation'
import { useStoreAtmosphere } from './useStoreAtmosphere'
import { useInventory } from './useInventory'
import { useCorporateFinance } from './useCorporateFinance'

interface PendingEvent {
  id: EventId
  day: number
}

interface ActiveDemandEffect {
  multiplier: number
  expiresDay: number
}

interface HistoryEntry {
  day: number
  id: EventId
  choice: 'A' | 'B'
  message: string
}

interface EventsState {
  pendingEvent: PendingEvent | null
  activeEffects: ActiveDemandEffect[]
  history: HistoryEntry[]
  daysSinceLastEvent: number

  resolveChoice: (choice: 'A' | 'B') => void
  demandMultiplier: () => number
  tickDaily: (day: number) => void
}

export const useEvents = create<EventsState>((set, get) => ({
  pendingEvent: null,
  activeEffects: [],
  history: [],
  daysSinceLastEvent: 0,

  resolveChoice: (choice) => {
    const state = get()
    const pending = state.pendingEvent
    if (!pending) return

    const stockroomValue = Object.entries(useInventory.getState().stockroom).reduce((sum, [productId, qty]) => {
      const product = PRODUCT_MAP[productId]
      return product ? sum + product.costPrice * qty : sum
    }, 0)

    const outcome = resolveEvent(pending.id, choice, {
      cleanliness: useStoreAtmosphere.getState().cleanliness,
      stockroomValue,
      insuranceActive: useCorporateFinance.getState().insuranceActive,
    })

    if (outcome.cashDelta !== 0) useFinance.getState().applyOperatingResult(outcome.cashDelta)
    if (outcome.reputationDelta !== 0) useReputation.getState().applyDelta(outcome.reputationDelta)

    const activeEffects = [...state.activeEffects]
    if (outcome.demandEffect) {
      activeEffects.push({ multiplier: outcome.demandEffect.multiplier, expiresDay: pending.day + outcome.demandEffect.durationDays })
    }

    set({
      pendingEvent: null,
      activeEffects,
      history: [{ day: pending.day, id: pending.id, choice, message: outcome.message }, ...state.history].slice(0, 8),
    })
  },

  demandMultiplier: () => get().activeEffects.reduce((product, effect) => product * effect.multiplier, 1),

  tickDaily: (day) => {
    const state = get()
    const activeEffects = state.activeEffects.filter((e) => e.expiresDay > day)

    let pendingEvent = state.pendingEvent
    let daysSinceLastEvent = state.daysSinceLastEvent + 1

    if (!pendingEvent && daysSinceLastEvent >= EVENT_MIN_GAP_DAYS && Math.random() < EVENT_DAILY_CHANCE) {
      const id = EVENT_IDS[Math.floor(Math.random() * EVENT_IDS.length)]
      pendingEvent = { id, day }
      daysSinceLastEvent = 0
    }

    set({ activeEffects, pendingEvent, daysSinceLastEvent })
  },
}))
