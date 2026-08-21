import { cellKey, edgeKey, type Cell, type WallOrientation } from '../systems/grid'
import type { PlacedFixture, WallSegment, StoreBlueprint } from '../stores/useStoreLayout'
import type { FixtureCategory } from './fixtureDefinitions'

interface BlueprintSpec {
  name: string
  floors: Cell[]
  walls: { cell: Cell; orientation: WallOrientation }[]
  fixtures: { category: FixtureCategory; cell: Cell; rotation: number }[]
}

/** Builds a valid StoreBlueprint from cell lists using the same grid.ts key
 * helpers the rest of the app relies on, rather than hand-typing key
 * strings — a mistyped key would silently fail to render correctly. */
function buildBlueprint(spec: BlueprintSpec): StoreBlueprint {
  const floors: Record<string, Cell> = {}
  for (const cell of spec.floors) floors[cellKey(cell)] = cell

  const walls: Record<string, WallSegment> = {}
  for (const w of spec.walls) walls[edgeKey(w.cell, w.orientation)] = w

  const fixtures: Record<string, PlacedFixture> = {}
  spec.fixtures.forEach((f, i) => {
    const id = `${f.category}-starter-${i}`
    fixtures[id] = { id, category: f.category, cell: f.cell, rotation: f.rotation }
  })

  return { name: spec.name, savedAt: Date.now(), floors, walls, fixtures, upperLevels: {}, maxLevel: 0 }
}

/** Rectangular room perimeter walls with one gap cell left open on the
 * south wall as the entrance. */
function roomPerimeter(x0: number, z0: number, x1: number, z1: number, entranceX: number): { cell: Cell; orientation: WallOrientation }[] {
  const walls: { cell: Cell; orientation: WallOrientation }[] = []
  for (let x = x0; x <= x1; x++) {
    walls.push({ cell: { x, z: z0 }, orientation: 'N' }) // top
    if (x !== entranceX) walls.push({ cell: { x, z: z1 + 1 }, orientation: 'N' }) // bottom, minus entrance
  }
  for (let z = z0; z <= z1; z++) {
    walls.push({ cell: { x: x0, z }, orientation: 'W' }) // left
    walls.push({ cell: { x: x1 + 1, z }, orientation: 'W' }) // right
  }
  return walls
}

function roomFloors(x0: number, z0: number, x1: number, z1: number): Cell[] {
  const cells: Cell[] = []
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) cells.push({ x, z })
  }
  return cells
}

const COZY_CORNER_STORE = buildBlueprint({
  name: 'Cozy Corner Store',
  floors: roomFloors(2, 2, 6, 6),
  walls: roomPerimeter(2, 2, 6, 6, 4),
  fixtures: [
    { category: 'shelf', cell: { x: 3, z: 3 }, rotation: 0 },
    { category: 'shelf', cell: { x: 5, z: 3 }, rotation: 0 },
    { category: 'checkout', cell: { x: 4, z: 5 }, rotation: 0 },
  ],
})

const BIG_BOX_LAYOUT = buildBlueprint({
  name: 'Big Box Layout',
  floors: roomFloors(2, 2, 11, 9),
  walls: roomPerimeter(2, 2, 11, 9, 6),
  fixtures: [
    { category: 'shelf', cell: { x: 3, z: 3 }, rotation: 0 },
    { category: 'shelf', cell: { x: 5, z: 3 }, rotation: 0 },
    { category: 'shelf', cell: { x: 7, z: 3 }, rotation: 0 },
    { category: 'shelf', cell: { x: 9, z: 3 }, rotation: 0 },
    { category: 'shelf', cell: { x: 3, z: 6 }, rotation: 0 },
    { category: 'shelf', cell: { x: 5, z: 6 }, rotation: 0 },
    { category: 'shelf', cell: { x: 7, z: 6 }, rotation: 0 },
    { category: 'shelf', cell: { x: 9, z: 6 }, rotation: 0 },
    { category: 'checkout', cell: { x: 5, z: 8 }, rotation: 0 },
    { category: 'checkout', cell: { x: 7, z: 8 }, rotation: 0 },
  ],
})

export const STARTER_BLUEPRINTS: StoreBlueprint[] = [COZY_CORNER_STORE, BIG_BOX_LAYOUT]
