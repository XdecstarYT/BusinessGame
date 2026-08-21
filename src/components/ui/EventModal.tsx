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
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-96 bg-[#15171e] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <span className="text-2xl">{def.icon}</span>
          <span className="font-semibold text-white">{def.title}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-white/80 mb-4">{def.prompt}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => resolveChoice('A')}
              className="text-left px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm hover:bg-emerald-500/25 transition-colors"
            >
              {def.choiceA.label}
            </button>
            <button
              onClick={() => resolveChoice('B')}
              className="text-left px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white/80 text-sm hover:bg-white/10 transition-colors"
            >
              {def.choiceB.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
