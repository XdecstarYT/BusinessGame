export type StaffRole = 'stocker' | 'cashier' | 'janitor' | 'security' | 'manager'
export type Shift = 'morning' | 'evening' | 'allday'

export interface StaffRoleDefinition {
  role: StaffRole
  label: string
  marketRate: number
  color: string
  description: string
}

export const STAFF_ROLES: Record<StaffRole, StaffRoleDefinition> = {
  stocker: {
    role: 'stocker',
    label: 'Stocker',
    marketRate: 60,
    color: '#e08a3c',
    description: 'Automatically restocks shelves running low from the stockroom.',
  },
  cashier: {
    role: 'cashier',
    label: 'Cashier',
    marketRate: 65,
    color: '#3c7fe0',
    description: 'Mans an assigned checkout counter, cutting customer checkout time.',
  },
  janitor: {
    role: 'janitor',
    label: 'Janitor',
    marketRate: 55,
    color: '#3ce08a',
    description: 'Keeps the store clean, which keeps customers shopping longer.',
  },
  security: {
    role: 'security',
    label: 'Security',
    marketRate: 70,
    color: '#e0423c',
    description: 'On duty, sharply cuts the odds of a shoplifter getting away with it.',
  },
  manager: {
    role: 'manager',
    label: 'Manager',
    marketRate: 95,
    color: '#a855f7',
    description: 'Works the back office, not the floor — auto-reorders signed supply contracts before you run dry.',
  },
}

export const SHIFT_WINDOWS: Record<Shift, { startHour: number; endHour: number; label: string }> = {
  morning: { startHour: 8, endHour: 15, label: 'Morning (8–3)' },
  evening: { startHour: 15, endHour: 22, label: 'Evening (3–10)' },
  allday: { startHour: 8, endHour: 22, label: 'All Day (8–10)' },
}

export const STARTING_MORALE = 70
export const WAGE_STEP = 5
