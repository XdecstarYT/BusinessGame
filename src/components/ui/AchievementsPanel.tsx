import { useAchievements } from '../../stores/useAchievements'
import { ACHIEVEMENTS } from '../../data/achievements'

interface AchievementsPanelProps {
  onClose: () => void
}

export function AchievementsPanel({ onClose }: AchievementsPanelProps) {
  const unlocked = useAchievements((s) => s.unlocked)
  const unlockedCount = Object.keys(unlocked).length

  return (
    <div className="pointer-events-auto absolute top-36 right-4 w-80 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">
          🏆 Achievements <span className="text-white/40 font-normal">({unlockedCount}/{ACHIEVEMENTS.length})</span>
        </span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const day = unlocked[a.id]
          const isUnlocked = day !== undefined
          return (
            <div
              key={a.id}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border ${
                isUnlocked ? 'bg-amber-500/10 border-amber-400/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <span className={`text-xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${isUnlocked ? 'text-white' : 'text-white/50'}`}>{a.label}</div>
                <div className="text-[10px] text-white/40">{a.description}</div>
              </div>
              {isUnlocked && <span className="text-[10px] text-amber-300">Day {day}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
