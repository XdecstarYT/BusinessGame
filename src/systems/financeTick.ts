// Pure — no React/Zustand imports, unit-testable in isolation.

/** Flat rate on positive daily profit before tax — a simplified stand-in
 * for real tax brackets, consistent with the spec's "Finance depth" ask
 * without a full tax-bracket simulation. */
export const TAX_RATE = 0.15

export interface DaySummary {
  day: number
  revenue: number
  cogs: number
  rent: number
  payroll: number
  shrinkage: number
  marketing: number
  taxes: number
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
  const profitBeforeTax = revenue - cogs - rent - payroll - shrinkage - marketing
  const taxes = profitBeforeTax > 0 ? profitBeforeTax * TAX_RATE : 0
  return { day, revenue, cogs, rent, payroll, shrinkage, marketing, taxes, profit: profitBeforeTax - taxes }
}
