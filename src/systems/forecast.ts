// Pure — no React/Zustand imports, unit-testable in isolation.

/** Simple linear regression over a value series, projected `daysAhead`
 * beyond the last data point — a naive but honest trend forecast, not a
 * black box. Returns the last value unchanged with fewer than 2 points. */
export function linearForecast(values: number[], daysAhead: number): number {
  const n = values.length
  if (n === 0) return 0
  if (n < 2) return values[0]

  const xMean = (n - 1) / 2
  const yMean = values.reduce((sum, v) => sum + v, 0) / n

  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean)
    denominator += (i - xMean) * (i - xMean)
  }
  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = yMean - slope * xMean

  return intercept + slope * (n - 1 + daysAhead)
}
