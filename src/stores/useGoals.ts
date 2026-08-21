import { create } from 'zustand'
import { useFinance } from './useFinance'

export type GoalKind = 'serveCustomers' | 'earnProfit' | 'reputationFloor'

interface GoalTemplate {
  kind: GoalKind
  label: (target: number) => string
  target: number
  reward: number
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  { kind: 'serveCustomers', label: (t) => `Serve ${t} customers this week`, target: 45, reward: 300 },
  { kind: 'earnProfit', label: (t) => `Earn $${t} profit this week`, target: 350, reward: 400 },
  { kind: 'reputationFloor', label: (t) => `Keep reputation at ${t}%+ all week`, target: 55, reward: 250 },
]

export interface WeeklyGoal {
  kind: GoalKind
  label: string
  target: number
  reward: number
}

export interface WeeklyGoalResult {
  label: string
  success: boolean
  reward: number
}

interface GoalsState {
  goal: WeeklyGoal
  progress: number
  reputationFloorBroken: boolean
  daysIntoWeek: number
  completedCount: number
  lastResult: WeeklyGoalResult | null

  tickDaily: (customersServedToday: number, dailyProfit: number, reputationNow: number) => void
  dismissResult: () => void
}

function randomGoal(): WeeklyGoal {
  const t = GOAL_TEMPLATES[Math.floor(Math.random() * GOAL_TEMPLATES.length)]
  return { kind: t.kind, label: t.label(t.target), target: t.target, reward: t.reward }
}

export const useGoals = create<GoalsState>((set, get) => ({
  goal: randomGoal(),
  progress: 0,
  reputationFloorBroken: false,
  daysIntoWeek: 0,
  completedCount: 0,
  lastResult: null,

  tickDaily: (customersServedToday, dailyProfit, reputationNow) => {
    const state = get()
    let progress = state.progress
    let reputationFloorBroken = state.reputationFloorBroken

    if (state.goal.kind === 'serveCustomers') progress += customersServedToday
    else if (state.goal.kind === 'earnProfit') progress += Math.max(0, dailyProfit)
    else if (state.goal.kind === 'reputationFloor' && reputationNow < state.goal.target) reputationFloorBroken = true

    const daysIntoWeek = state.daysIntoWeek + 1
    if (daysIntoWeek >= 7) {
      const success = state.goal.kind === 'reputationFloor' ? !reputationFloorBroken : progress >= state.goal.target
      if (success) useFinance.getState().addCash(state.goal.reward)
      set({
        goal: randomGoal(),
        progress: 0,
        reputationFloorBroken: false,
        daysIntoWeek: 0,
        completedCount: state.completedCount + (success ? 1 : 0),
        lastResult: { label: state.goal.label, success, reward: state.goal.reward },
      })
    } else {
      set({ progress, reputationFloorBroken, daysIntoWeek })
    }
  },

  dismissResult: () => set({ lastResult: null }),
}))
