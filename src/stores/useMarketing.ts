import { create } from 'zustand'
import { useFinance } from './useFinance'

export interface CampaignTier {
  id: string
  label: string
  budget: number
  /** 0..1 additional attractiveness boost while active — diminishing
   * returns on spend, not linear. */
  boost: number
  durationDays: number
}

export const CAMPAIGN_TIERS: CampaignTier[] = [
  { id: 'flyer', label: 'Local Flyers', budget: 200, boost: 0.15, durationDays: 3 },
  { id: 'radio', label: 'Radio Spot', budget: 500, boost: 0.3, durationDays: 5 },
  { id: 'city', label: 'City Campaign', budget: 1200, boost: 0.5, durationDays: 7 },
]

interface ActiveCampaign {
  tierId: string
  label: string
  boost: number
  daysRemaining: number
}

interface MarketingState {
  activeCampaign: ActiveCampaign | null

  launchCampaign: (tierId: string) => boolean
  tickDaily: () => void
  attractivenessBoost: () => number
}

export const useMarketing = create<MarketingState>((set, get) => ({
  activeCampaign: null,

  launchCampaign: (tierId) => {
    const tier = CAMPAIGN_TIERS.find((t) => t.id === tierId)
    if (!tier) return false
    if (!useFinance.getState().spend(tier.budget)) return false
    useFinance.getState().recordMarketingSpend(tier.budget)
    set({ activeCampaign: { tierId: tier.id, label: tier.label, boost: tier.boost, daysRemaining: tier.durationDays } })
    return true
  },

  tickDaily: () => {
    const campaign = get().activeCampaign
    if (!campaign) return
    const daysRemaining = campaign.daysRemaining - 1
    set({ activeCampaign: daysRemaining > 0 ? { ...campaign, daysRemaining } : null })
  },

  attractivenessBoost: () => get().activeCampaign?.boost ?? 0,
}))
