// Pure — no React/Zustand imports, unit-testable in isolation.

/** A simplified stand-in for a real valuation model: cash on hand, plus a
 * multiple on trailing profit (only when positive — losses don't inflate
 * valuation), plus a reputation contribution since brand strength matters
 * to investors too. */
const PROFIT_MULTIPLE = 15
const REPUTATION_WEIGHT = 50

export function computeValuation(cash: number, trailingProfit: number, reputationScore: number): number {
  const profitContribution = Math.max(0, trailingProfit) * PROFIT_MULTIPLE
  const reputationContribution = reputationScore * REPUTATION_WEIGHT
  return Math.max(0, cash + profitContribution + reputationContribution)
}

/** Total repayment spread evenly over the term — simple interest, not
 * compounding amortization, to keep the mechanic legible. */
export function loanTotalRepayment(principal: number, dailyRate: number, termDays: number): number {
  return principal * (1 + dailyRate * termDays)
}

export function loanDailyPayment(principal: number, dailyRate: number, termDays: number): number {
  return loanTotalRepayment(principal, dailyRate, termDays) / termDays
}
