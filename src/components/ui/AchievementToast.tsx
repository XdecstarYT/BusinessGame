import { useEffect } from 'react'
import { useAchievements } from '../../stores/useAchievements'
import { ACHIEVEMENTS } from '../../data/achievements'

const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))
const AUTO_DISMISS_MS = 5000

export function AchievementToast() {
  const recentUnlocks = useAchievements((s) => s.recentUnlocks)
  const dismissRecent = useAchievements((s) => s.dismissRecent)

  useEffect(() => {
    if (recentUnlocks.length === 0) return
    const timers = recentUnlocks.map((id) => setTimeout(() => dismissRecent(id), AUTO_DISMISS_MS))
    return () => timers.forEach(clearTimeout)
  }, [recentUnlocks, dismissRecent])

  if (recentUnlocks.length === 0) return null

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1.5">
      {recentUnlocks.map((id) => {
        const def = ACHIEVEMENT_MAP[id]
        if (!def) return null
        return (
          <div
            key={id}
            className="hud-panel-enter flex items-center gap-2.5 bg-gradient-to-b from-amber-500/20 to-amber-600/10 border border-amber-400/40 rounded-xl px-3.5 py-2.5 shadow-[0_12px_30px_-10px_rgba(251,191,36,0.5)] backdrop-blur-xl"
          >
            <span className="text-xl">{def.icon}</span>
            <div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-[0.08em]">Achievement unlocked</div>
              <div className="text-xs text-white font-semibold">{def.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
