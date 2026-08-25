import { useEvents } from '../../stores/useEvents'
import { EVENT_DEFINITIONS } from '../../data/events'

/** A short, blocking-feeling decision prompt for random events/crises — the
 * simulation keeps running underneath (no hard-pause), it just needs the
 * player's attention before the next choice matters. */
export function EventModal() {
  const pendingEvent = useEvents((s) => s.pendingEvent)
  const resolveChoice = useEvents((s) => s.resolveChoice)

  if (!pendingEvent) return null
  const def = EVENT_DEFINITIONS[pendingEvent.id]

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-50">
      <div className="hud-panel-enter w-96 max-w-[92vw] rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1f29]/98 to-[#111319]/98 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-2xl">
            {def.icon}
          </span>
          <span className="font-bold text-white tracking-wide">{def.title}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-white/80 mb-4 leading-relaxed">{def.prompt}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => resolveChoice('A')}
              className="text-left px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm font-medium hover:bg-emerald-500/25 hover:border-emerald-400/50 transition-colors"
            >
              {def.choiceA.label}
            </button>
            <button
              onClick={() => resolveChoice('B')}
              className="text-left px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/25 transition-colors"
            >
              {def.choiceB.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
