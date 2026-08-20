import { create } from 'zustand'
import type { FixtureCategory } from '../data/fixtureDefinitions'
import { cellKey, edgeKey, type Cell, type WallOrientation } from '../systems/grid'

export interface PlacedFixture {
  id: string
  category: FixtureCategory
  cell: Cell
  rotation: number
}

export interface WallSegment {
  cell: Cell
  orientation: WallOrientation
}

interface LayoutSnapshot {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
  fixtures: Record<string, PlacedFixture>
}

export interface StoreBlueprint extends LayoutSnapshot {
  name: string
  savedAt: number
}

const MAX_HISTORY = 50

interface StoreLayoutState extends LayoutSnapshot {
  past: LayoutSnapshot[]
  future: LayoutSnapshot[]

  placeFloor: (cell: Cell) => void
  removeFloor: (cell: Cell) => void
  placeWall: (cell: Cell, orientation: WallOrientation) => void
  removeWall: (cell: Cell, orientation: WallOrientation) => void
  placeFixture: (category: FixtureCategory, cell: Cell, rotation: number) => void
  removeFixtureAt: (cell: Cell) => void

  hasFloorAt: (cell: Cell) => boolean
  hasFixtureAt: (cell: Cell) => boolean

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clearAll: () => void

  serialize: (name: string) => StoreBlueprint
  loadBlueprint: (blueprint: StoreBlueprint) => void
}

function snapshotOf(state: LayoutSnapshot): LayoutSnapshot {
  return {
    floors: { ...state.floors },
    walls: { ...state.walls },
    fixtures: { ...state.fixtures },
  }
}

export const useStoreLayout = create<StoreLayoutState>((set, get) => ({
  floors: {},
  walls: {},
  fixtures: {},
  past: [],
  future: [],

  hasFloorAt: (cell) => cellKey(cell) in get().floors,
  hasFixtureAt: (cell) => Object.values(get().fixtures).some((f) => f.cell.x === cell.x && f.cell.z === cell.z),

  placeFloor: (cell) => {
    const state = get()
    const key = cellKey(cell)
    if (key in state.floors) return
    set({
      past: pushHistory(state),
      future: [],
      floors: { ...state.floors, [key]: cell },
    })
  },

  removeFloor: (cell) => {
    const state = get()
    const key = cellKey(cell)
    if (!(key in state.floors)) return
    const floors = { ...state.floors }
    delete floors[key]
    set({ past: pushHistory(state), future: [], floors })
  },

  placeWall: (cell, orientation) => {
    const state = get()
    const key = edgeKey(cell, orientation)
    if (key in state.walls) return
    set({
      past: pushHistory(state),
      future: [],
      walls: { ...state.walls, [key]: { cell, orientation } },
    })
  },

  removeWall: (cell, orientation) => {
    const state = get()
    const key = edgeKey(cell, orientation)
    if (!(key in state.walls)) return
    const walls = { ...state.walls }
    delete walls[key]
    set({ past: pushHistory(state), future: [], walls })
  },

  placeFixture: (category, cell, rotation) => {
    const state = get()
    if (get().hasFixtureAt(cell)) return
    const id = `${category}-${cellKey(cell)}-${Date.now()}`
    set({
      past: pushHistory(state),
      future: [],
      fixtures: { ...state.fixtures, [id]: { id, category, cell, rotation } },
    })
  },

  removeFixtureAt: (cell) => {
    const state = get()
    const entry = Object.entries(state.fixtures).find(([, f]) => f.cell.x === cell.x && f.cell.z === cell.z)
    if (!entry) return
    const fixtures = { ...state.fixtures }
    delete fixtures[entry[0]]
    set({ past: pushHistory(state), future: [], fixtures })
  },

  undo: () => {
    const state = get()
    if (state.past.length === 0) return
    const previous = state.past[state.past.length - 1]
    set({
      ...previous,
      past: state.past.slice(0, -1),
      future: [snapshotOf(state), ...state.future],
    })
  },

  redo: () => {
    const state = get()
    if (state.future.length === 0) return
    const next = state.future[0]
    set({
      ...next,
      past: [...state.past, snapshotOf(state)],
      future: state.future.slice(1),
    })
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clearAll: () => {
    const state = get()
    set({ past: pushHistory(state), future: [], floors: {}, walls: {}, fixtures: {} })
  },

  serialize: (name) => ({
    ...snapshotOf(get()),
    name,
    savedAt: Date.now(),
  }),

  loadBlueprint: (blueprint) => {
    const state = get()
    set({
      past: pushHistory(state),
      future: [],
      floors: { ...blueprint.floors },
      walls: { ...blueprint.walls },
      fixtures: { ...blueprint.fixtures },
    })
  },
}))

function pushHistory(state: LayoutSnapshot & { past: LayoutSnapshot[] }): LayoutSnapshot[] {
  const past = [...state.past, snapshotOf(state)]
  return past.length > MAX_HISTORY ? past.slice(past.length - MAX_HISTORY) : past
}
