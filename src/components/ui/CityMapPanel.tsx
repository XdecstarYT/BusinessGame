import { useFinance } from '../../stores/useFinance'
import { NEIGHBORHOODS } from '../../data/neighborhoods'
import { useCityMap } from '../../stores/useCityMap'

interface CityMapPanelProps {
  onClose: () => void
}

const smallBtn =
  'px-2 py-1 rounded text-[11px] font-medium bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

export function CityMapPanel({ onClose }: CityMapPanelProps) {
  const cash = useFinance((s) => s.cash)
  const ownedPlotIds = useCityMap((s) => s.ownedPlotIds)
  const selectedPlotId = useCityMap((s) => s.selectedPlotId)
  const selectPlot = useCityMap((s) => s.selectPlot)
  const acquirePlot = useCityMap((s) => s.acquirePlot)

  return (
    <div className="pointer-events-auto absolute top-20 right-4 w-80 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">🗺️ City Map</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="text-[11px] text-white/40 italic mb-3">
          Acquiring a plot unlocks the location — running it as a second live store is a future upgrade.
        </div>

        <div className="flex flex-col gap-2">
          {NEIGHBORHOODS.map((plot) => {
            const owned = ownedPlotIds.includes(plot.id)
            const selected = selectedPlotId === plot.id
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
                  {owned && <span className="text-[10px] text-emerald-400 font-semibold">OWNED</span>}
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">{plot.description}</div>
                <div className="text-[10px] text-white/40 mt-1">
                  {plot.demographic} · Foot traffic {plot.footTraffic}/100
                </div>
                {!owned && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-white/70">${plot.acquisitionCost.toLocaleString()}</span>
                    <button
                      className={smallBtn}
                      disabled={cash < plot.acquisitionCost}
                      onClick={(e) => {
                        e.stopPropagation()
                        acquirePlot(plot.id)
                      }}
                    >
                      Acquire
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
