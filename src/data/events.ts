export type EventId = 'health-inspection' | 'product-recall' | 'pr-incident' | 'break-in' | 'weather-disruption' | 'economic-boom' | 'economic-recession'

export interface EventChoiceDefinition {
  id: 'A' | 'B'
  label: string
}

export interface EventDefinition {
  id: EventId
  title: string
  icon: string
  prompt: string
  choiceA: EventChoiceDefinition
  choiceB: EventChoiceDefinition
}

export const EVENT_DEFINITIONS: Record<EventId, EventDefinition> = {
  'health-inspection': {
    id: 'health-inspection',
    title: 'Health Inspection',
    icon: '🩺',
    prompt: 'A health inspector just walked in for a surprise visit.',
    choiceA: { id: 'A', label: 'Hire an emergency cleaning crew ($300)' },
    choiceB: { id: 'B', label: 'Let them inspect as-is' },
  },
  'product-recall': {
    id: 'product-recall',
    title: 'Product Recall',
    icon: '⚠️',
    prompt: 'A supplier just issued a recall notice for a product on your shelves.',
    choiceA: { id: 'A', label: 'Pull it and dispose of it properly ($250)' },
    choiceB: { id: 'B', label: 'Quietly sell through remaining stock' },
  },
  'pr-incident': {
    id: 'pr-incident',
    title: 'PR Incident',
    icon: '📰',
    prompt: 'A scathing review of your store is going viral locally.',
    choiceA: { id: 'A', label: 'Hire a PR firm to respond ($500)' },
    choiceB: { id: 'B', label: 'Ignore it and hope it blows over' },
  },
  'break-in': {
    id: 'break-in',
    title: 'Overnight Break-In',
    icon: '🚨',
    prompt: 'Someone broke into the stockroom overnight.',
    choiceA: { id: 'A', label: 'File a police report + insurance claim ($100 fee)' },
    choiceB: { id: 'B', label: 'Handle it quietly, skip the paperwork' },
  },
  'weather-disruption': {
    id: 'weather-disruption',
    title: 'Storm Warning',
    icon: '⛈️',
    prompt: 'A major storm is rolling through the area for the next few days.',
    choiceA: { id: 'A', label: 'Close early each day until it passes' },
    choiceB: { id: 'B', label: 'Stay open through it' },
  },
  'economic-boom': {
    id: 'economic-boom',
    title: 'Local Economic Boom',
    icon: '📈',
    prompt: 'The local economy is booming — people are spending more than usual.',
    choiceA: { id: 'A', label: 'Invest ahead of the demand ($400)' },
    choiceB: { id: 'B', label: 'Ride the wave without investing further' },
  },
  'economic-recession': {
    id: 'economic-recession',
    title: 'Local Economic Downturn',
    icon: '📉',
    prompt: 'A local economic downturn is squeezing household budgets.',
    choiceA: { id: 'A', label: 'Cut prices to stay competitive ($200)' },
    choiceB: { id: 'B', label: 'Hold steady and wait it out' },
  },
}

export const EVENT_IDS = Object.keys(EVENT_DEFINITIONS) as EventId[]

/** Minimum days between events, and the daily chance once that gap has
 * passed — tuned for roughly one event every 1.5-2 weeks. */
export const EVENT_MIN_GAP_DAYS = 5
export const EVENT_DAILY_CHANCE = 0.35
