import { create } from 'zustand'

interface CustomersState {
  activeCount: number
  servedToday: number
  events: string[]

  setActiveCount: (count: number) => void
  recordSaleEvent: (message: string) => void
  resetDaily: () => void
}

/** UI-visible aggregate customer state. The live per-customer simulation
 * (position, path, cart) lives outside Zustand in systems/customerSimulation
 * — it mutates every frame and would otherwise cause a React re-render per
 * customer per frame. This store only changes on discrete events. */
export const useCustomers = create<CustomersState>((set) => ({
  activeCount: 0,
  servedToday: 0,
  events: [],

  setActiveCount: (activeCount) => set({ activeCount }),

  recordSaleEvent: (message) =>
    set((state) => ({
      servedToday: state.servedToday + 1,
      events: [message, ...state.events].slice(0, 5),
    })),

  resetDaily: () => set({ servedToday: 0 }),
}))
