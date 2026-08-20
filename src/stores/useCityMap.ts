import { create } from 'zustand'
import { useFinance } from './useFinance'
import { NEIGHBORHOODS } from '../data/neighborhoods'

interface CityMapState {
  ownedPlotIds: string[]
  selectedPlotId: string | null

  selectPlot: (id: string | null) => void
  isOwned: (id: string) => boolean
  /** costOverride lets the caller (CityMapPanel) charge a contested-plot
   * premium computed via useCompetitors — kept out of this store to avoid
   * a circular import between the two. */
  acquirePlot: (id: string, costOverride?: number) => boolean
}

/** Home plot is owned from the start — it's the store the player already runs. */
export const HOME_PLOT_ID = 'downtown'

export const useCityMap = create<CityMapState>((set, get) => ({
  ownedPlotIds: [HOME_PLOT_ID],
  selectedPlotId: null,

  selectPlot: (id) => set({ selectedPlotId: id }),
  isOwned: (id) => get().ownedPlotIds.includes(id),

  acquirePlot: (id, costOverride) => {
    if (get().isOwned(id)) return false
    const plot = NEIGHBORHOODS.find((p) => p.id === id)
    if (!plot) return false
    if (!useFinance.getState().spend(costOverride ?? plot.acquisitionCost)) return false
    set((s) => ({ ownedPlotIds: [...s.ownedPlotIds, id] }))
    return true
  },
}))
