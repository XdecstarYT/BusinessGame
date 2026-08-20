export interface LoanOffer {
  id: string
  label: string
  principal: number
  /** Interest rate applied per day over the term to compute total repayment. */
  dailyRate: number
  termDays: number
  minCreditScore: number
}

export const LOAN_OFFERS: LoanOffer[] = [
  { id: 'starter', label: 'Starter Loan', principal: 5000, dailyRate: 0.004, termDays: 30, minCreditScore: 0 },
  { id: 'growth', label: 'Growth Loan', principal: 15000, dailyRate: 0.003, termDays: 45, minCreditScore: 55 },
  { id: 'expansion', label: 'Expansion Loan', principal: 40000, dailyRate: 0.0022, termDays: 60, minCreditScore: 75 },
]

export const STARTING_CREDIT_SCORE = 65
export const CREDIT_SCORE_ON_TIME_PAYMENT = 0.3
export const CREDIT_SCORE_MISSED_PAYMENT = -3

export const INSURANCE_DAILY_PREMIUM = 15
/** Fraction of a theft-shrinkage loss reimbursed while insurance is active. */
export const INSURANCE_REIMBURSEMENT_RATE = 0.5

export interface FundingRound {
  id: string
  label: string
  /** Equity given up, purely a flavor/valuation-drag stat — this is not a
   * full cap-table simulation. */
  equityPercent: number
  /** Cash raised = current valuation * this fraction. */
  valuationFraction: number
  minValuation: number
}

export const FUNDING_ROUNDS: FundingRound[] = [
  { id: 'angel', label: 'Angel Round', equityPercent: 8, valuationFraction: 0.15, minValuation: 10000 },
  { id: 'growth-capital', label: 'Growth Capital', equityPercent: 12, valuationFraction: 0.2, minValuation: 60000 },
  { id: 'private-equity', label: 'Private Equity', equityPercent: 15, valuationFraction: 0.25, minValuation: 200000 },
]

export const IPO_VALUATION_THRESHOLD = 500000
/** One-time IPO cash proceeds as a fraction of valuation at time of listing. */
export const IPO_PROCEEDS_FRACTION = 0.3
export const QUARTER_DAYS = 30
