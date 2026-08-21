import { create } from 'zustand'

interface BestSale {
  label: string
  amount: number
}

interface CustomersState {
  activeCount: number
  servedToday: number
  events: string[]
  bestSaleToday: BestSale | null

  setActiveCount: (count: number) => void
  recordSaleEvent: (message: string) => void
  trackSale: (amount: number, label: string) => void
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
  bestSaleToday: null,

  setActiveCount: (activeCount) => set({ activeCount }),

  recordSaleEvent: (message) =>
    set((state) => ({
      servedToday: state.servedToday + 1,
      events: [message, ...state.events].slice(0, 5),
    })),

  trackSale: (amount, label) =>
    set((state) => (!state.bestSaleToday || amount > state.bestSaleToday.amount ? { bestSaleToday: { amount, label } } : state)),

  resetDaily: () => set({ servedToday: 0, bestSaleToday: null }),
}))
