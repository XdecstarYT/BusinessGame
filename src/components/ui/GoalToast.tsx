import { useEffect } from 'react'
import { useGoals } from '../../stores/useGoals'
import { Icon } from './icons'

const AUTO_DISMISS_MS = 6000

export function GoalToast() {
  const lastResult = useGoals((s) => s.lastResult)
  const dismissResult = useGoals((s) => s.dismissResult)

  useEffect(() => {
    if (!lastResult) return
    const timer = setTimeout(() => dismissResult(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [lastResult, dismissResult])

  if (!lastResult) return null

  return (
    <div className="pointer-events-none absolute bottom-24 left-4">
      <div
        className={`hud-panel-enter flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 shadow-lg backdrop-blur-xl border ${
          lastResult.success
            ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 border-emerald-400/40'
            : 'bg-gradient-to-b from-white/10 to-white/5 border-white/15'
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-lg ${
            lastResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
          }`}
        >
          <Icon name="target" size={16} />
        </span>
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.08em] ${lastResult.success ? 'text-emerald-300' : 'text-white/50'}`}>
            {lastResult.success ? `Weekly goal complete +$${lastResult.reward}` : 'Weekly goal missed'}
          </div>
          <div className="text-xs text-white font-semibold">{lastResult.label}</div>
        </div>
      </div>
    </div>
  )
}
