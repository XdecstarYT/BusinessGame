// Pure — no React/Zustand imports, unit-testable in isolation.
import type { Shift, StaffRole } from '../data/staffDefinitions'
import { SHIFT_WINDOWS } from '../data/staffDefinitions'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function isOnDuty(shift: Shift, hour: number): boolean {
  const window = SHIFT_WINDOWS[shift]
  return hour >= window.startHour && hour < window.endHour
}

/** How efficiently a staff member works at a given morale — scales
 * restock amounts, cleaning amounts, and checkout speed bonuses. */
export function moraleEfficiency(morale: number): number {
  return 0.6 + (morale / 100) * 0.7
}

/** Multiplier applied to base checkout dwell time. Unstaffed checkouts are
 * unaffected (self-checkout baseline); a staffed one gets meaningfully
 * faster, more so at higher morale. */
export function checkoutDwellMultiplier(staffed: boolean, morale: number): number {
  if (!staffed) return 1
  return clamp(0.85 / moraleEfficiency(morale), 0.4, 0.85)
}

const BASE_MORALE_TARGET = 70
const WAGE_SENSITIVITY = 150

/** Where morale drifts toward, driven by wage relative to market rate.
 * Paying exactly market rate holds morale steady at the starting value. */
export function moraleTarget(wage: number, marketRate: number): number {
  const ratio = (wage - marketRate) / marketRate
  return clamp(BASE_MORALE_TARGET + ratio * WAGE_SENSITIVITY, 5, 100)
}

const IDEAL_RATIO: Record<StaffRole, number> = { stocker: 4, cashier: 1, janitor: 30 }
const MAX_WORKLOAD_PENALTY = 25

/** Extra morale-target penalty when a role is stretched thin — e.g. one
 * stocker covering far more shelves than they can reasonably keep stocked. */
export function workloadPenalty(role: StaffRole, onDutyCount: number, relevantCount: number): number {
  if (onDutyCount === 0 || relevantCount === 0) return 0
  const ratio = relevantCount / onDutyCount
  const ideal = IDEAL_RATIO[role]
  if (ratio <= ideal) return 0
  const overload = (ratio - ideal) / ideal
  return clamp(overload * 20, 0, MAX_WORKLOAD_PENALTY)
}

/** Steps current morale a fraction of the way toward its target — gradual
 * drift rather than an instant snap, applied once per day. */
export function driftMorale(current: number, target: number, step = 0.3): number {
  return clamp(current + (target - current) * step, 0, 100)
}
