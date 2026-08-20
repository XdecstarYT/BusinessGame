// Pure — no React/Zustand imports, unit-testable in isolation.

export interface DaySummary {
  day: number
  revenue: number
  cogs: number
  rent: number
  profit: number
}

export function computeDaySummary(day: number, revenue: number, cogs: number, rent: number): DaySummary {
  return { day, revenue, cogs, rent, profit: revenue - cogs - rent }
}
