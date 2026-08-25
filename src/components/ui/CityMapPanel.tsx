import { useState } from 'react'
import { useFinance } from '../../stores/useFinance'
import { NEIGHBORHOODS } from '../../data/neighborhoods'
import { useCityMap } from '../../stores/useCityMap'
import { useCompetitors } from '../../stores/useCompetitors'
import { COMPETITOR_CHAIN_MAP } from '../../data/competitors'
import { PanelShell } from './PanelShell'
import { btn } from './theme'

interface CityMapPanelProps {
  onClose: () => void
  top?: number
}

const smallBtn = btn.ghost

export function CityMapPanel({ onClose, top }: CityMapPanelProps) {
  const cash = useFinance((s) => s.cash)
  const ownedPlotIds = useCityMap((s) => s.ownedPlotIds)
  const selectedPlotId = useCityMap((s) => s.selectedPlotId)
  const selectPlot = useCityMap((s) => s.selectPlot)
  const acquirePlot = useCityMap((s) => s.acquirePlot)

  const presences = useCompetitors((s) => s.presences)
  const contestedAcquisitionCost = useCompetitors((s) => s.contestedAcquisitionCost)
  const removeCompetitor = useCompetitors((s) => s.removeCompetitor)
  const priceWarPlots = useCompetitors((s) => s.priceWarPlots)
  const rivalryScore = useCompetitors((s) => s.rivalryScore())

  const [scoutedPlotId, setScoutedPlotId] = useState<string | null>(null)

  return (
    <PanelShell icon="city" title="City Map" onClose={onClose} position="right-4" top={top}>
      <div className="px-4 py-3">
        <div className="text-[11px] text-white/40 italic mb-2">
          Acquired locations run under a chain manager — see HQ for their numbers. A rival-held plot costs more to take, but buys them out.
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-white/50 shrink-0">Rivalry</span>
          <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all ${rivalryScore >= 60 ? 'bg-red-400' : rivalryScore >= 30 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${rivalryScore}%` }}
            />
          </div>
          <span className="text-[10px] text-white/50 w-7 text-right">{rivalryScore}</span>
        </div>

        <div className="flex flex-col gap-2">
          {NEIGHBORHOODS.map((plot) => {
            const owned = ownedPlotIds.includes(plot.id)
            const selected = selectedPlotId === plot.id
            const presence = presences[plot.id]
            const chain = presence ? COMPETITOR_CHAIN_MAP[presence.chainId] : undefined
            const scouted = scoutedPlotId === plot.id
            const cost = contestedAcquisitionCost(plot.acquisitionCost, plot.id)

            return (
              <div
                key={plot.id}
                role="button"
                tabIndex={0}
                onClick={() => selectPlot(plot.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') selectPlot(plot.id)
                }}
                className={`text-left rounded-lg px-3 py-2 border transition-colors cursor-pointer ${
                  selected ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{plot.name}</span>
                  <div className="flex items-center gap-1.5">
                    {!owned && chain && priceWarPlots[plot.id] && <span className="text-[10px] font-semibold text-red-400">🔥 Price war</span>}
                    {owned && <span className="text-[10px] text-emerald-400 font-semibold">OWNED</span>}
                    {!owned && chain && (
                      <span className="text-[10px] font-semibold" style={{ color: chain.color }}>
                        {chain.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">{plot.description}</div>
                <div className="text-[10px] text-white/40 mt-1">
                  {plot.demographic} · Foot traffic {plot.footTraffic}/100
                </div>

                {!owned && chain && (
                  <div className="mt-1.5">
                    <button
                      className={smallBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        setScoutedPlotId(scouted ? null : plot.id)
                      }}
                    >
                      {scouted ? 'Hide intel' : '🔍 Scout'}
                    </button>
                    {scouted && (
                      <div className="text-[10px] text-white/50 bg-white/5 rounded px-2 py-1.5 mt-1.5">
                        {chain.description}
                        <br />
                        Strategy: <span className="text-white/70">{chain.strategy}</span> · Price index:{' '}
                        <span className="text-white/70">{presence!.priceIndex.toFixed(2)}x</span>
                      </div>
                    )}
                  </div>
                )}

                {!owned && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-white/70">
                      ${cost.toLocaleString()}
                      {chain && <span className="text-red-300"> (contested)</span>}
                    </span>
                    <button
                      className={smallBtn}
                      disabled={cash < cost}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (acquirePlot(plot.id, cost)) removeCompetitor(plot.id)
                      }}
                    >
                      {chain ? 'Buy Out' : 'Acquire'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </PanelShell>
  )
}
