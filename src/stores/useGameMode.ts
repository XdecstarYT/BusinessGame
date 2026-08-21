import { create } from 'zustand'

export type GameMode = 'build' | 'walk' | 'city'

/** 'build' is untimed planning — the clock is frozen and nothing simulates.
 * 'play' is a live, running store: the clock advances and customers/staff
 * simulate. Orthogonal to `mode`, which only picks the camera/scene. */
export type GamePhase = 'build' | 'play'

/** Only meaningful in Walk mode during Play: 'freeroam' is the existing
 * first-person walk-and-look camera; 'cinematic' hands the camera to
 * CinematicCameraRig, which cuts between customers and staff on its own. */
export type CameraStyle = 'freeroam' | 'cinematic'

export type TimeScale = 1 | 2 | 4

interface GameModeState {
  mode: GameMode
  phase: GamePhase
  cameraStyle: CameraStyle
  timeScale: TimeScale
  paused: boolean

  setMode: (mode: GameMode) => void
  toggleMode: () => void
  /** Leaves Build phase and opens the store for a live day — locks the
   * camera to Walk mode, the only view available while playing. */
  startDay: () => void
  /** Closes the store and returns to untimed Build phase. */
  endDay: () => void
  setCameraStyle: (style: CameraStyle) => void
  toggleCameraStyle: () => void
  setTimeScale: (scale: TimeScale) => void
  togglePaused: () => void
}

export const useGameMode = create<GameModeState>((set, get) => ({
  mode: 'build',
  phase: 'build',
  cameraStyle: 'freeroam',
  timeScale: 1,
  paused: false,

  setMode: (mode) => {
    // While the store is open, the camera is locked to Walk mode — there's
    // no editing or city-map browsing to switch to.
    if (get().phase === 'play' && mode !== 'walk') return
    set({ mode })
  },
  toggleMode: () => set({ mode: get().mode === 'build' ? 'walk' : 'build' }),
  startDay: () => set({ phase: 'play', mode: 'walk', timeScale: 1, paused: false, cameraStyle: 'freeroam' }),
  endDay: () => set({ phase: 'build', mode: 'build', timeScale: 1, paused: false, cameraStyle: 'freeroam' }),

  setCameraStyle: (cameraStyle) => set({ cameraStyle }),
  toggleCameraStyle: () => set((s) => ({ cameraStyle: s.cameraStyle === 'freeroam' ? 'cinematic' : 'freeroam' })),
  setTimeScale: (timeScale) => set({ timeScale, paused: false }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
}))
