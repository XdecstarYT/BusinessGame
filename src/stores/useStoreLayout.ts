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

export interface LayoutSnapshot {
  floors: Record<string, Cell>
  walls: Record<string, WallSegment>
  fixtures: Record<string, PlacedFixture>
}

export interface StoreBlueprint extends LayoutSnapshot {
  name: string
  savedAt: number
  upperLevels?: Record<number, LayoutSnapshot>
  maxLevel?: number
}

/** Shared empty layout so a not-yet-built level resolves to a stable
 * reference instead of a fresh `{}` every selector call. */
export const EMPTY_LAYOUT: LayoutSnapshot = { floors: {}, walls: {}, fixtures: {} }

const MAX_HISTORY = 50

interface HistorySnapshot extends LayoutSnapshot {
  upperLevels: Record<number, LayoutSnapshot>
}

interface StoreLayoutState extends LayoutSnapshot {
  /** Level 0 is the ground floor and lives on the fields above (unchanged
   * since Phase 1/2, so pathfinding/customer/staff simulation/inventory —
   * all of which are intentionally floor-0-only — keep working untouched).
   * Levels 1+ are purely additive here. */
  upperLevels: Record<number, LayoutSnapshot>
  activeLevel: number
  maxLevel: number

  past: HistorySnapshot[]
  future: HistorySnapshot[]

  setActiveLevel: (level: number) => void
  addLevel: () => void

  placeFloor: (cell: Cell) => void
  removeFloor: (cell: Cell) => void
  placeWall: (cell: Cell, orientation: WallOrientation) => void
  removeWall: (cell: Cell, orientation: WallOrientation) => void
  placeFixture: (category: FixtureCategory, cell: Cell, rotation: number) => void
  removeFixtureAt: (cell: Cell) => void

  hasFloorAt: (cell: Cell, level?: number) => boolean
  hasFixtureAt: (cell: Cell, level?: number) => boolean
  hasStairsAt: (cell: Cell, level: number) => boolean

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clearAll: () => void

  serialize: (name: string) => StoreBlueprint
  loadBlueprint: (blueprint: StoreBlueprint) => void
}

function levelSnapshotOf(state: LayoutSnapshot & { upperLevels: Record<number, LayoutSnapshot> }, level: number): LayoutSnapshot {
  if (level === 0) return { floors: state.floors, walls: state.walls, fixtures: state.fixtures }
  return state.upperLevels[level] ?? EMPTY_LAYOUT
}

function withLevelSnapshot(
  state: LayoutSnapshot & { upperLevels: Record<number, LayoutSnapshot> },
  level: number,
  snapshot: LayoutSnapshot,
): Pick<StoreLayoutState, 'floors' | 'walls' | 'fixtures' | 'upperLevels'> {
  if (level === 0) {
    return { floors: snapshot.floors, walls: snapshot.walls, fixtures: snapshot.fixtures, upperLevels: state.upperLevels }
  }
  return {
    floors: state.floors,
    walls: state.walls,
    fixtures: state.fixtures,
    upperLevels: { ...state.upperLevels, [level]: snapshot },
  }
}

function fullSnapshotOf(state: HistorySnapshot): HistorySnapshot {
  return {
    floors: { ...state.floors },
    walls: { ...state.walls },
    fixtures: { ...state.fixtures },
    upperLevels: Object.fromEntries(
      Object.entries(state.upperLevels).map(([lvl, snap]) => [
        lvl,
        { floors: { ...snap.floors }, walls: { ...snap.walls }, fixtures: { ...snap.fixtures } },
      ]),
    ),
  }
}

export const useStoreLayout = create<StoreLayoutState>((set, get) => ({
  floors: {},
  walls: {},
  fixtures: {},
  upperLevels: {},
  activeLevel: 0,
  maxLevel: 0,
  past: [],
  future: [],

  setActiveLevel: (level) => {
    if (level < 0 || level > get().maxLevel) return
    set({ activeLevel: level })
  },

  addLevel: () => {
    const nextLevel = get().maxLevel + 1
    set({ maxLevel: nextLevel, activeLevel: nextLevel })
  },

  hasFloorAt: (cell, level) => cellKey(cell) in levelSnapshotOf(get(), level ?? get().activeLevel).floors,

  hasFixtureAt: (cell, level) => {
    const snap = levelSnapshotOf(get(), level ?? get().activeLevel)
    return Object.values(snap.fixtures).some((f) => f.cell.x === cell.x && f.cell.z === cell.z)
  },

  hasStairsAt: (cell, level) => {
    const snap = levelSnapshotOf(get(), level)
    return Object.values(snap.fixtures).some((f) => f.category === 'stairs' && f.cell.x === cell.x && f.cell.z === cell.z)
  },

  placeFloor: (cell) => {
    const state = get()
    const level = state.activeLevel
    const snap = levelSnapshotOf(state, level)
    const key = cellKey(cell)
    if (key in snap.floors) return
    set({
      past: pushHistory(state),
      future: [],
      ...withLevelSnapshot(state, level, { ...snap, floors: { ...snap.floors, [key]: cell } }),
    })
  },

  removeFloor: (cell) => {
    const state = get()
    const level = state.activeLevel
    const snap = levelSnapshotOf(state, level)
    const key = cellKey(cell)
    if (!(key in snap.floors)) return
    const floors = { ...snap.floors }
    delete floors[key]
    set({ past: pushHistory(state), future: [], ...withLevelSnapshot(state, level, { ...snap, floors }) })
  },

  placeWall: (cell, orientation) => {
    const state = get()
    const level = state.activeLevel
    const snap = levelSnapshotOf(state, level)
    const key = edgeKey(cell, orientation)
    if (key in snap.walls) return
    set({
      past: pushHistory(state),
      future: [],
      ...withLevelSnapshot(state, level, { ...snap, walls: { ...snap.walls, [key]: { cell, orientation } } }),
    })
  },

  removeWall: (cell, orientation) => {
    const state = get()
    const level = state.activeLevel
    const snap = levelSnapshotOf(state, level)
    const key = edgeKey(cell, orientation)
    if (!(key in snap.walls)) return
    const walls = { ...snap.walls }
    delete walls[key]
    set({ past: pushHistory(state), future: [], ...withLevelSnapshot(state, level, { ...snap, walls }) })
  },

  placeFixture: (category, cell, rotation) => {
    const state = get()
    const level = state.activeLevel
    const snap = levelSnapshotOf(state, level)
    if (Object.values(snap.fixtures).some((f) => f.cell.x === cell.x && f.cell.z === cell.z)) return
    const id = `${category}-L${level}-${cellKey(cell)}-${Date.now()}`
    set({
      past: pushHistory(state),
      future: [],
      ...withLevelSnapshot(state, level, { ...snap, fixtures: { ...snap.fixtures, [id]: { id, category, cell, rotation } } }),
    })
  },

  removeFixtureAt: (cell) => {
    const state = get()
    const level = state.activeLevel
    const snap = levelSnapshotOf(state, level)
    const entry = Object.entries(snap.fixtures).find(([, f]) => f.cell.x === cell.x && f.cell.z === cell.z)
    if (!entry) return
    const fixtures = { ...snap.fixtures }
    delete fixtures[entry[0]]
    set({ past: pushHistory(state), future: [], ...withLevelSnapshot(state, level, { ...snap, fixtures }) })
  },

  undo: () => {
    const state = get()
    if (state.past.length === 0) return
    const previous = state.past[state.past.length - 1]
    set({
      ...previous,
      past: state.past.slice(0, -1),
      future: [fullSnapshotOf(state), ...state.future],
    })
  },

  redo: () => {
    const state = get()
    if (state.future.length === 0) return
    const next = state.future[0]
    set({
      ...next,
      past: [...state.past, fullSnapshotOf(state)],
      future: state.future.slice(1),
    })
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clearAll: () => {
    const state = get()
    set({ past: pushHistory(state), future: [], floors: {}, walls: {}, fixtures: {}, upperLevels: {}, maxLevel: 0, activeLevel: 0 })
  },

  serialize: (name) => ({
    ...fullSnapshotOf(get()),
    maxLevel: get().maxLevel,
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
      upperLevels: blueprint.upperLevels ? { ...blueprint.upperLevels } : {},
      maxLevel: blueprint.maxLevel ?? 0,
      activeLevel: 0,
    })
  },
}))

function pushHistory(state: HistorySnapshot & { past: HistorySnapshot[] }): HistorySnapshot[] {
  const past = [...state.past, fullSnapshotOf(state)]
  return past.length > MAX_HISTORY ? past.slice(past.length - MAX_HISTORY) : past
}

/** Non-reactive lookup of a level's layout, for use outside React (e.g. Player's per-frame stairs check). */
export function levelLayout(level: number): LayoutSnapshot {
  return levelSnapshotOf(useStoreLayout.getState(), level)
}
