import { create } from 'zustand'

interface AnalyticsState {
  showHeatmap: boolean
  toggleHeatmap: () => void
  /** Lifetime revenue by product category — real sale totals, not an
   * approximation from current stock. */
  categoryRevenue: Record<string, number>
  recordCategoryRevenue: (category: string, amount: number) => void
}

export const useAnalytics = create<AnalyticsState>((set) => ({
  showHeatmap: false,
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),

  categoryRevenue: {},
  recordCategoryRevenue: (category, amount) =>
    set((s) => ({ categoryRevenue: { ...s.categoryRevenue, [category]: (s.categoryRevenue[category] ?? 0) + amount } })),
}))
