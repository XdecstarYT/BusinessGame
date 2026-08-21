import { useFinance } from '../../stores/useFinance'
import { CAMPAIGN_TIERS, useMarketing } from '../../stores/useMarketing'
import { PanelShell } from './PanelShell'
import { btn, sectionLabel } from './theme'

interface MarketingPanelProps {
  onClose: () => void
}

const smallBtn = btn.ghost

export function MarketingPanel({ onClose }: MarketingPanelProps) {
  const cash = useFinance((s) => s.cash)
  const activeCampaign = useMarketing((s) => s.activeCampaign)
  const launchCampaign = useMarketing((s) => s.launchCampaign)

  return (
    <PanelShell icon="megaphone" title="Marketing" onClose={onClose}>
      <div className="px-4 py-3">
        {activeCampaign ? (
          <div className="text-xs bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-3 py-2 mb-3">
            <div className="font-medium text-emerald-300">{activeCampaign.label} running</div>
            <div className="text-white/60 mt-0.5">
              +{Math.round(activeCampaign.boost * 100)}% foot traffic · {activeCampaign.daysRemaining} day
              {activeCampaign.daysRemaining === 1 ? '' : 's'} left
            </div>
          </div>
        ) : (
          <div className="text-xs text-white/40 italic mb-3">No campaign running — customers arrive at the baseline rate.</div>
        )}

        <div className={sectionLabel}>Launch a campaign</div>
        <div className="flex flex-col gap-2">
          {CAMPAIGN_TIERS.map((tier) => (
            <div key={tier.id} className="flex items-center gap-2 py-1.5 border-b border-white/[0.06] last:border-b-0">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{tier.label}</div>
                <div className="text-[10px] text-white/50">
                  ${tier.budget} · +{Math.round(tier.boost * 100)}% foot traffic for {tier.durationDays} days
                </div>
              </div>
              <button className={smallBtn} disabled={cash < tier.budget} onClick={() => launchCampaign(tier.id)}>
                {activeCampaign ? 'Replace' : 'Launch'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  )
}
