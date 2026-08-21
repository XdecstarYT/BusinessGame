import { create } from 'zustand'

interface ComplaintsState {
  events: string[]
  countToday: number
  totalCount: number

  recordComplaint: (message: string) => void
  resetDaily: () => void
}

/** Ambient customer-complaint feed — separate from useCustomers' sale/theft
 * toast stack so "the store has problems" reads as its own signal (fed into
 * the Play-phase ticker) rather than getting lost among sale notifications. */
export const useComplaints = create<ComplaintsState>((set) => ({
  events: [],
  countToday: 0,
  totalCount: 0,

  recordComplaint: (message) =>
    set((state) => ({
      events: [message, ...state.events].slice(0, 8),
      countToday: state.countToday + 1,
      totalCount: state.totalCount + 1,
    })),

  resetDaily: () => set({ countToday: 0 }),
}))
