import { create } from 'zustand'

export type GameMode = 'build' | 'walk' | 'city'

/** 'build' is untimed planning — the clock is frozen and nothing simulates.
 * 'play' is a live, running store: the clock advances and customers/staff
 * simulate. Orthogonal to `mode`, which only picks the camera/scene. */
export type GamePhase = 'build' | 'play'

interface GameModeState {
  mode: GameMode
  phase: GamePhase
  setMode: (mode: GameMode) => void
  toggleMode: () => void
  /** Leaves Build phase and opens the store for a live day — locks the
   * camera to Walk mode, the only view available while playing. */
  startDay: () => void
  /** Closes the store and returns to untimed Build phase. */
  endDay: () => void
}

export const useGameMode = create<GameModeState>((set, get) => ({
  mode: 'build',
  phase: 'build',
  setMode: (mode) => {
    // While the store is open, the camera is locked to Walk mode — there's
    // no editing or city-map browsing to switch to.
    if (get().phase === 'play' && mode !== 'walk') return
    set({ mode })
  },
  toggleMode: () => set({ mode: get().mode === 'build' ? 'walk' : 'build' }),
  startDay: () => set({ phase: 'play', mode: 'walk' }),
  endDay: () => set({ phase: 'build', mode: 'build' }),
}))
