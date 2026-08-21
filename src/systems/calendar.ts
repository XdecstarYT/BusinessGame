// Pure — no React/Zustand imports, unit-testable in isolation.
import { HOLIDAYS, SEASON_LENGTH_DAYS, WEEKDAY_LABELS, WEEKEND_DEMAND_MULTIPLIER, YEAR_LENGTH_DAYS, SEASONS, type Holiday, type Season } from '../data/calendar'

/** 0=Mon .. 6=Sun. Day 1 (game start) is a Monday, arbitrarily. */
export function dayOfWeekIndex(day: number): number {
  return (day - 1) % 7
}

export function dayOfWeekLabel(day: number): string {
  return WEEKDAY_LABELS[dayOfWeekIndex(day)]
}

export function isWeekend(day: number): boolean {
  const i = dayOfWeekIndex(day)
  return i === 5 || i === 6
}

/** 1-based position within the recurring YEAR_LENGTH_DAYS cycle. */
export function dayOfYear(day: number): number {
  return ((day - 1) % YEAR_LENGTH_DAYS) + 1
}

export function seasonForDay(day: number): Season {
  const doy = dayOfYear(day)
  return SEASONS[Math.min(SEASONS.length - 1, Math.floor((doy - 1) / SEASON_LENGTH_DAYS))]
}

export function activeHoliday(day: number): Holiday | null {
  const doy = dayOfYear(day)
  for (const holiday of HOLIDAYS) {
    if (doy >= holiday.dayOfYear && doy < holiday.dayOfYear + holiday.durationDays) return holiday
  }
  return null
}

/** Combined demand multiplier for customer spawn rate — a holiday takes
 * priority over the plain weekend bump (they don't stack) since a holiday
 * already implies "everyone's out shopping" more strongly than a normal
 * Saturday. */
export function demandMultiplierForDay(day: number): number {
  const holiday = activeHoliday(day)
  if (holiday) return holiday.demandMultiplier
  return isWeekend(day) ? WEEKEND_DEMAND_MULTIPLIER : 1
}
