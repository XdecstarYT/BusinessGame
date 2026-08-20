import { create } from 'zustand'
import type { FixtureCategory } from '../data/fixtureDefinitions'
import { nextRotation } from '../systems/grid'

export type BuildTool = 'floor' | 'wall' | FixtureCategory

interface BuildToolState {
  tool: BuildTool
  rotation: number
  setTool: (tool: BuildTool) => void
  rotateSelection: () => void
}

export const useBuildTool = create<BuildToolState>((set, get) => ({
  tool: 'floor',
  rotation: 0,
  setTool: (tool) => set({ tool }),
  rotateSelection: () => set({ rotation: nextRotation(get().rotation) }),
}))
