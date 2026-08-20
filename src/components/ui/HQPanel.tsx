import { useFinance } from '../../stores/useFinance'
import { useReputation } from '../../stores/useReputation'
import { useCorporateHQ } from '../../stores/useCorporateHQ'
import { NEIGHBORHOODS } from '../../data/neighborhoods'
import { MANAGER_QUALITY_UPGRADE_COST, MAX_MANAGER_QUALITY } from '../../systems/corporateHQ'
import { FRANCHISE_UNLOCK_REPUTATION, MAX_FRANCHISEES, FRANCHISEE_LICENSE_COST, FRANCHISEE_DAILY_ROYALTY } from '../../data/franchise'

interface HQPanelProps {
  onClose: () => void
}

const smallBtn =
  'px-2 py-1 rounded text-[11px] font-medium bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

export function HQPanel({ onClose }: HQPanelProps) {
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
    <div className="pointer-events-auto absolute top-36 right-4 w-96 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">🏢 HQ</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="text-[11px] text-white/50 mb-1">Chain-wide, today</div>
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

        <div className="text-[11px] text-white/50 mb-1">Managed locations</div>
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

        <div className="text-[11px] text-white/50 mb-1">Franchising</div>
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
            <div className="text-[11px] text-white/50 mb-1">Recent activity</div>
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
    </div>
  )
}
