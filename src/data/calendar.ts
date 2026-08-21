export type Season = 'spring' | 'summer' | 'fall' | 'winter'

export const SEASON_LENGTH_DAYS = 30
export const YEAR_LENGTH_DAYS = SEASON_LENGTH_DAYS * 4

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter']

export const SEASON_LABELS: Record<Season, { label: string; icon: string }> = {
  spring: { label: 'Spring', icon: '🌸' },
  summer: { label: 'Summer', icon: '☀️' },
  fall: { label: 'Fall', icon: '🍂' },
  winter: { label: 'Winter', icon: '❄️' },
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const WEEKEND_DEMAND_MULTIPLIER = 1.2

export interface Holiday {
  id: string
  label: string
  /** 1-based day-of-year within the YEAR_LENGTH_DAYS cycle. */
  dayOfYear: number
  durationDays: number
  demandMultiplier: number
  icon: string
}

export const HOLIDAYS: Holiday[] = [
  { id: 'spring-sale', label: 'Spring Sale Weekend', dayOfYear: 15, durationDays: 2, demandMultiplier: 1.3, icon: '🌸' },
  { id: 'summer-blowout', label: 'Summer Blowout', dayOfYear: 45, durationDays: 3, demandMultiplier: 1.35, icon: '🎆' },
  { id: 'harvest-festival', label: 'Harvest Festival', dayOfYear: 75, durationDays: 2, demandMultiplier: 1.3, icon: '🍁' },
  { id: 'winter-holiday-rush', label: 'Winter Holiday Rush', dayOfYear: 105, durationDays: 6, demandMultiplier: 1.6, icon: '🎄' },
]
