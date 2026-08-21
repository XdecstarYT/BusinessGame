// Pure — no React/Zustand imports, unit-testable in isolation.
import type { EventId } from '../data/events'

export interface DemandEffect {
  multiplier: number
  durationDays: number
}

export interface EventOutcome {
  message: string
  /** Negative = cost. */
  cashDelta: number
  reputationDelta: number
  demandEffect?: DemandEffect
}

function resolveHealthInspection(choice: 'A' | 'B', cleanliness: number, random: () => number): EventOutcome {
  if (choice === 'A') {
    return { message: 'Passed with a spotless store — the crew earned their fee.', cashDelta: -300, reputationDelta: 0 }
  }
  if (cleanliness >= 60) {
    return { message: 'Store passed the inspection on its own merits.', cashDelta: 0, reputationDelta: 1 }
  }
  if (random() < 0.7) {
    return { message: 'Failed the inspection — fined, and reputation took a hit.', cashDelta: -200, reputationDelta: -8 }
  }
  return { message: 'Scraped by, barely.', cashDelta: 0, reputationDelta: -2 }
}

function resolveProductRecall(choice: 'A' | 'B', random: () => number): EventOutcome {
  if (choice === 'A') return { message: 'Recalled product pulled and disposed of properly.', cashDelta: -250, reputationDelta: 1 }
  if (random() < 0.4) return { message: 'A customer got sick — word got out and it cost you.', cashDelta: -400, reputationDelta: -12 }
  return { message: 'Got lucky — nobody noticed.', cashDelta: 0, reputationDelta: 0 }
}

function resolvePRIncident(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') return { message: 'The PR firm got ahead of the story.', cashDelta: -500, reputationDelta: -2 }
  return { message: 'It blew over eventually, but not before doing damage.', cashDelta: 0, reputationDelta: -10 }
}

function resolveBreakIn(choice: 'A' | 'B', stockroomValue: number, insuranceActive: boolean): EventOutcome {
  if (choice === 'A') {
    const lossRate = insuranceActive ? 0.075 : 0.15
    const message = insuranceActive
      ? 'Police report filed — insurance covered half the loss.'
      : 'Police report filed, but you have no insurance to claim against.'
    return { message, cashDelta: -(stockroomValue * lossRate) - 100, reputationDelta: 0 }
  }
  return { message: 'Handled quietly — lost more stock with no way to recoup it.', cashDelta: -(stockroomValue * 0.3), reputationDelta: 0 }
}

function resolveWeatherDisruption(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'Closed early through the storm — safe, but quieter sales.', cashDelta: 0, reputationDelta: 0, demandEffect: { multiplier: 0.6, durationDays: 3 } }
  }
  return { message: 'Stayed open through the storm.', cashDelta: 0, reputationDelta: 0, demandEffect: { multiplier: 0.85, durationDays: 3 } }
}

function resolveEconomicBoom(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'Invested ahead of the boom — paid off.', cashDelta: -400, reputationDelta: 0, demandEffect: { multiplier: 1.4, durationDays: 5 } }
  }
  return { message: 'Rode the boom without investing further.', cashDelta: 0, reputationDelta: 0, demandEffect: { multiplier: 1.2, durationDays: 5 } }
}

function resolveEconomicRecession(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'Cut prices to stay competitive through the downturn.', cashDelta: -200, reputationDelta: 0, demandEffect: { multiplier: 0.95, durationDays: 5 } }
  }
  return { message: 'Held steady through the downturn.', cashDelta: 0, reputationDelta: 0, demandEffect: { multiplier: 0.75, durationDays: 5 } }
}

function resolveViralSocialPost(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'Rode the viral wave with paid promotion — traffic surged.', cashDelta: -150, reputationDelta: 3, demandEffect: { multiplier: 1.5, durationDays: 4 } }
  }
  return { message: 'The moment spread on its own — a smaller but free bump.', cashDelta: 0, reputationDelta: 2, demandEffect: { multiplier: 1.2, durationDays: 4 } }
}

function resolveCelebrityVisit(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'The comped order paid off — great photos, great buzz.', cashDelta: -60, reputationDelta: 6, demandEffect: { multiplier: 1.3, durationDays: 3 } }
  }
  return { message: 'Business as usual — word still got around a little.', cashDelta: 0, reputationDelta: 1, demandEffect: { multiplier: 1.1, durationDays: 2 } }
}

function resolveSupplierPriceHike(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'Absorbed the price hike — customers never noticed.', cashDelta: -300, reputationDelta: 2, demandEffect: { multiplier: 1, durationDays: 1 } }
  }
  return { message: "Passed the cost along — some customers grumbled.", cashDelta: 0, reputationDelta: -3, demandEffect: { multiplier: 0.9, durationDays: 4 } }
}

function resolveStaffWalkoutThreat(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'The bonus smoothed things over — morale is back up.', cashDelta: -250, reputationDelta: 1, demandEffect: { multiplier: 1, durationDays: 1 } }
  }
  return { message: 'Brushed off — service quality slipped for a while.', cashDelta: 0, reputationDelta: -4, demandEffect: { multiplier: 0.88, durationDays: 4 } }
}

function resolveCopycatCompetitor(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'The price-match promise held customers steady.', cashDelta: -200, reputationDelta: 1, demandEffect: { multiplier: 1, durationDays: 1 } }
  }
  return { message: 'Stayed the course — lost some price-sensitive shoppers.', cashDelta: 0, reputationDelta: 0, demandEffect: { multiplier: 0.85, durationDays: 5 } }
}

function resolveCommunityFundraiser(choice: 'A' | 'B'): EventOutcome {
  if (choice === 'A') {
    return { message: 'Sponsoring the fundraiser earned real community goodwill.', cashDelta: -150, reputationDelta: 5, demandEffect: { multiplier: 1.1, durationDays: 3 } }
  }
  return { message: 'Declined politely — no real fallout, no goodwill either.', cashDelta: 0, reputationDelta: -1 }
}

export interface EventResolutionInputs {
  cleanliness: number
  stockroomValue: number
  insuranceActive: boolean
  random?: () => number
}

export function resolveEvent(id: EventId, choice: 'A' | 'B', inputs: EventResolutionInputs): EventOutcome {
  const random = inputs.random ?? Math.random
  switch (id) {
    case 'health-inspection':
      return resolveHealthInspection(choice, inputs.cleanliness, random)
    case 'product-recall':
      return resolveProductRecall(choice, random)
    case 'pr-incident':
      return resolvePRIncident(choice)
    case 'break-in':
      return resolveBreakIn(choice, inputs.stockroomValue, inputs.insuranceActive)
    case 'weather-disruption':
      return resolveWeatherDisruption(choice)
    case 'economic-boom':
      return resolveEconomicBoom(choice)
    case 'economic-recession':
      return resolveEconomicRecession(choice)
    case 'viral-social-post':
      return resolveViralSocialPost(choice)
    case 'celebrity-visit':
      return resolveCelebrityVisit(choice)
    case 'supplier-price-hike':
      return resolveSupplierPriceHike(choice)
    case 'staff-walkout-threat':
      return resolveStaffWalkoutThreat(choice)
    case 'copycat-competitor':
      return resolveCopycatCompetitor(choice)
    case 'community-fundraiser':
      return resolveCommunityFundraiser(choice)
  }
}
