// Pure — no React/Zustand imports, unit-testable in isolation.

export interface DaySummary {
  day: number
  revenue: number
  cogs: number
  rent: number
  payroll: number
  shrinkage: number
  marketing: number
  profit: number
}

export interface DayInputs {
  day: number
  revenue: number
  cogs: number
  rent: number
  payroll: number
  shrinkage: number
  marketing: number
}

export function computeDaySummary(inputs: DayInputs): DaySummary {
  const { day, revenue, cogs, rent, payroll, shrinkage, marketing } = inputs
  return { day, revenue, cogs, rent, payroll, shrinkage, marketing, profit: revenue - cogs - rent - payroll - shrinkage - marketing }
}
