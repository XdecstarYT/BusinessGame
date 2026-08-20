import { create } from 'zustand'

export type GameMode = 'build' | 'walk' | 'city'

interface GameModeState {
  mode: GameMode
  setMode: (mode: GameMode) => void
  toggleMode: () => void
}

export const useGameMode = create<GameModeState>((set, get) => ({
  mode: 'build',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set({ mode: get().mode === 'build' ? 'walk' : 'build' }),
}))
