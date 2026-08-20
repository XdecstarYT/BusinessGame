import { create } from 'zustand'
import { STAFF_ROLES, STARTING_MORALE, type Shift, type StaffRole } from '../data/staffDefinitions'
import { driftMorale, moraleTarget, workloadPenalty } from '../systems/staffAI'
import { useFinance } from './useFinance'

export interface StaffMember {
  id: string
  role: StaffRole
  label: string
  shift: Shift
  wage: number
  morale: number
  assignedFixtureId: string | null
}

interface StaffState {
  roster: Record<string, StaffMember>

  hire: (role: StaffRole) => string | null
  fire: (id: string) => void
  setShift: (id: string, shift: Shift) => void
  adjustWage: (id: string, delta: number) => void
  assignCashier: (id: string, fixtureId: string | null) => void
  unassignFixture: (fixtureId: string) => void

  countOnRole: (role: StaffRole) => number
  totalDailyPayroll: () => number
  applyDailyDrift: (relevantCounts: Record<StaffRole, number>) => void
}

let nextStaffNumber = 1

export const useStaff = create<StaffState>((set, get) => ({
  roster: {},

  hire: (role) => {
    const def = STAFF_ROLES[role]
    if (useFinance.getState().cash < def.marketRate) return null

    const id = `staff-${role}-${Date.now()}-${nextStaffNumber}`
    const member: StaffMember = {
      id,
      role,
      label: `${def.label} #${nextStaffNumber}`,
      shift: 'allday',
      wage: def.marketRate,
      morale: STARTING_MORALE,
      assignedFixtureId: null,
    }
    nextStaffNumber += 1
    set((state) => ({ roster: { ...state.roster, [id]: member } }))
    return id
  },

  fire: (id) => {
    set((state) => {
      if (!(id in state.roster)) return state
      const roster = { ...state.roster }
      delete roster[id]
      return { roster }
    })
  },

  setShift: (id, shift) => {
    set((state) => {
      const member = state.roster[id]
      if (!member) return state
      return { roster: { ...state.roster, [id]: { ...member, shift } } }
    })
  },

  adjustWage: (id, delta) => {
    set((state) => {
      const member = state.roster[id]
      if (!member) return state
      return { roster: { ...state.roster, [id]: { ...member, wage: Math.max(0, member.wage + delta) } } }
    })
  },

  assignCashier: (id, fixtureId) => {
    set((state) => {
      const member = state.roster[id]
      if (!member || member.role !== 'cashier') return state
      return { roster: { ...state.roster, [id]: { ...member, assignedFixtureId: fixtureId } } }
    })
  },

  unassignFixture: (fixtureId) => {
    set((state) => {
      let changed = false
      const roster = { ...state.roster }
      for (const [id, member] of Object.entries(roster)) {
        if (member.assignedFixtureId === fixtureId) {
          roster[id] = { ...member, assignedFixtureId: null }
          changed = true
        }
      }
      return changed ? { roster } : state
    })
  },

  countOnRole: (role) => Object.values(get().roster).filter((m) => m.role === role).length,

  totalDailyPayroll: () => Object.values(get().roster).reduce((sum, m) => sum + m.wage, 0),

  applyDailyDrift: (relevantCounts) => {
    const state = get()
    const staffCounts: Partial<Record<StaffRole, number>> = {}
    for (const member of Object.values(state.roster)) {
      staffCounts[member.role] = (staffCounts[member.role] ?? 0) + 1
    }

    set((current) => {
      const roster = { ...current.roster }
      for (const [id, member] of Object.entries(roster)) {
        const def = STAFF_ROLES[member.role]
        const penalty = workloadPenalty(member.role, staffCounts[member.role] ?? 0, relevantCounts[member.role] ?? 0)
        const target = moraleTarget(member.wage, def.marketRate) - penalty
        roster[id] = { ...member, morale: driftMorale(member.morale, target) }
      }
      return { roster }
    })
  },
}))
