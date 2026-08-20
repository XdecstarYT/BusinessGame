import { useGameMode } from '../../stores/useGameMode'
import { BuildToolbar } from './BuildToolbar'

export function HUD() {
  const mode = useGameMode((s) => s.mode)
  const setMode = useGameMode((s) => s.setMode)

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <div className="pointer-events-auto absolute top-4 left-4 flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
        <span className="text-white font-semibold tracking-wide text-sm">🏪 Retail Empire</span>
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={() => setMode('build')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            mode === 'build' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          🔨 Build
        </button>
        <button
          onClick={() => setMode('walk')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            mode === 'walk' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          🚶 Walk
        </button>
      </div>

      {mode === 'walk' && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs bg-black/60 rounded-full px-3 py-1">
          Click to look around · WASD to move · Esc to release cursor
        </div>
      )}

      {mode === 'build' && <BuildToolbar />}
    </div>
  )
}
