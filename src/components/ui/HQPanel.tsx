import { useFinance } from '../../stores/useFinance'
import { useReputation } from '../../stores/useReputation'
import { useCorporateHQ } from '../../stores/useCorporateHQ'
import { NEIGHBORHOODS } from '../../data/neighborhoods'
import { MANAGER_QUALITY_UPGRADE_COST, MAX_MANAGER_QUALITY } from '../../systems/corporateHQ'
import { FRANCHISE_UNLOCK_REPUTATION, MAX_FRANCHISEES, FRANCHISEE_LICENSE_COST, FRANCHISEE_DAILY_ROYALTY } from '../../data/franchise'
import { PanelShell } from './PanelShell'
import { btn, sectionLabel } from './theme'

interface HQPanelProps {
  onClose: () => void
  top?: number
}

const smallBtn = btn.ghost

export function HQPanel({ onClose, top }: HQPanelProps) {
  const cash = useFinance((s) => s.cash)
  const dailyRevenue = useFinance((s) => s.dailyRevenue)
  const reputationScore = useReputation((s) => s.score)

  const locations = useCorporateHQ((s) => s.locations)
  const franchiseeCount = useCorporateHQ((s) => s.franchiseeCount)
  const events = useCorporateHQ((s) => s.events)
  const upgradeManager = useCorporateHQ((s) => s.upgradeManager)
  const franchiseUnlocked = useCorporateHQ((s) => s.franchiseUnlocked)
  const licenseFranchisee = useCorporateHQ((s) => s.licenseFranchisee)
  const chainWideDailyProfit = useCorporateHQ((s) => s.chainWideDailyProfit)

  const locationList = Object.values(locations)
  const chainProfit = chainWideDailyProfit()
  const royaltyIncome = franchiseeCount * FRANCHISEE_DAILY_ROYALTY
  const unlocked = franchiseUnlocked()

  return (
    <PanelShell icon="building" title="HQ" onClose={onClose} width="w-96" top={top}>
      <div className="px-4 py-3">
        <div className={sectionLabel}>Chain-wide, today</div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/60">Home store revenue</span>
          <span className="font-medium">${dailyRevenue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/60">Chain locations (yesterday)</span>
          <span className={`font-medium ${chainProfit - royaltyIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${(chainProfit - royaltyIncome).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-white/60">Franchise royalties</span>
          <span className="font-medium text-emerald-400">${royaltyIncome.toFixed(2)}</span>
        </div>

        <div className={sectionLabel}>Managed locations</div>
        {locationList.length === 0 ? (
          <div className="text-[10px] text-white/40 italic mb-3">
            No other locations yet — acquire a plot on the City Map to grow the chain.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-3">
            {locationList.map((location) => {
              const plot = NEIGHBORHOODS.find((p) => p.id === location.plotId)
              const maxed = location.managerQuality >= MAX_MANAGER_QUALITY
              return (
                <div key={location.plotId} className="text-[10px] bg-white/5 rounded px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{plot?.name ?? location.plotId}</span>
                    <span className={location.lastDailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      ${location.lastDailyProfit.toFixed(2)}/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/50">Manager quality: {Math.round(location.managerQuality * 100)}%</span>
                    <button className={smallBtn} disabled={maxed || cash < MANAGER_QUALITY_UPGRADE_COST} onClick={() => upgradeManager(location.plotId)}>
                      {maxed ? 'Maxed' : `Upgrade ($${MANAGER_QUALITY_UPGRADE_COST})`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className={sectionLabel}>Franchising</div>
        <div className="text-[10px] bg-white/5 rounded px-2 py-1.5 mb-3">
          {unlocked ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-white/60">
                  {franchiseeCount}/{MAX_FRANCHISEES} licensed · ${FRANCHISEE_DAILY_ROYALTY}/day each
                </span>
                <button
                  className={smallBtn}
                  disabled={franchiseeCount >= MAX_FRANCHISEES || cash < FRANCHISEE_LICENSE_COST}
                  onClick={() => licenseFranchisee()}
                >
                  License (${FRANCHISEE_LICENSE_COST.toLocaleString()})
                </button>
              </div>
              <div className="text-white/40 mt-1">Franchisees run themselves — no management, just royalty income.</div>
            </>
          ) : (
            <span className="text-white/40 italic">
              Needs {FRANCHISE_UNLOCK_REPUTATION}+ reputation (currently {Math.round(reputationScore)}) before anyone wants to license your concept.
            </span>
          )}
        </div>

        {events.length > 0 && (
          <div>
            <div className={sectionLabel}>Recent activity</div>
            <div className="flex flex-col gap-1">
              {events.slice(0, 4).map((event, i) => (
                <div key={i} className="text-[10px] text-white/50">
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelShell>
  )
}
