import { useAchievements } from '../../stores/useAchievements'
import { ACHIEVEMENTS } from '../../data/achievements'
import { PanelShell } from './PanelShell'

interface AchievementsPanelProps {
  onClose: () => void
}

export function AchievementsPanel({ onClose }: AchievementsPanelProps) {
  const unlocked = useAchievements((s) => s.unlocked)
  const unlockedCount = Object.keys(unlocked).length

  return (
    <PanelShell
      icon="trophy"
      title="Achievements"
      badge={<span className="text-white/40 font-normal text-xs">({unlockedCount}/{ACHIEVEMENTS.length})</span>}
      onClose={onClose}
    >
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
    </PanelShell>
  )
}
