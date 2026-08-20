// Pure — no React/Zustand imports, unit-testable in isolation.

export interface DaySummary {
  day: number
  revenue: number
  cogs: number
  rent: number
  payroll: number
  profit: number
}

export function computeDaySummary(day: number, revenue: number, cogs: number, rent: number, payroll: number): DaySummary {
  return { day, revenue, cogs, rent, payroll, profit: revenue - cogs - rent - payroll }
}
