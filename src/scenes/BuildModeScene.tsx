import { useCallback } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { CustomersLayer } from '../components/3d/CustomersLayer'
import { DustMotes } from '../components/3d/DustMotes'
import { GridFloor } from '../components/3d/GridFloor'
import { Ground } from '../components/3d/Ground'
import { LayoutRenderer } from '../components/3d/LayoutRenderer'
import { Ghost } from '../components/3d/Ghost'
import { LODTestProps } from '../components/3d/LODTestProps'
import { SalePopsLayer } from '../components/3d/SalePopsLayer'
import { SkyGradient } from '../components/3d/SkyGradient'
import { StaffLayer } from '../components/3d/StaffLayer'
import { StoreLighting } from '../components/3d/StoreLighting'
import { useGridSnap, type SnapTarget } from '../hooks/useGridSnap'
import { useBuildTool } from '../stores/useBuildTool'
import { useInventory } from '../stores/useInventory'
import { useStaff } from '../stores/useStaff'
import { EMPTY_LAYOUT, useStoreLayout } from '../stores/useStoreLayout'
import { GRID_WIDTH, GRID_DEPTH, LEVEL_HEIGHT, cellKey, edgeKey } from '../systems/grid'
import type { FixtureCategory } from '../data/fixtureDefinitions'

export function BuildModeScene() {
  const tool = useBuildTool((s) => s.tool)
  const rotation = useBuildTool((s) => s.rotation)

  const activeLevel = useStoreLayout((s) => s.activeLevel)
  const floors = useStoreLayout((s) => (s.activeLevel === 0 ? s.floors : (s.upperLevels[s.activeLevel]?.floors ?? EMPTY_LAYOUT.floors)))
  const walls = useStoreLayout((s) => (s.activeLevel === 0 ? s.walls : (s.upperLevels[s.activeLevel]?.walls ?? EMPTY_LAYOUT.walls)))
  const fixtures = useStoreLayout((s) => (s.activeLevel === 0 ? s.fixtures : (s.upperLevels[s.activeLevel]?.fixtures ?? EMPTY_LAYOUT.fixtures)))
  const placeFloor = useStoreLayout((s) => s.placeFloor)
  const removeFloor = useStoreLayout((s) => s.removeFloor)
  const placeWall = useStoreLayout((s) => s.placeWall)
  const removeWall = useStoreLayout((s) => s.removeWall)
  const placeFixture = useStoreLayout((s) => s.placeFixture)
  const removeFixtureAt = useStoreLayout((s) => s.removeFixtureAt)
  const hasFloorAt = useStoreLayout((s) => s.hasFloorAt)
  const hasFixtureAt = useStoreLayout((s) => s.hasFixtureAt)
  const maxLevel = useStoreLayout((s) => s.maxLevel)
  const removeInventoryFixture = useInventory((s) => s.removeFixture)
  const unassignStaffFixture = useStaff((s) => s.unassignFixture)

  const isValid = useCallback(
    (target: NonNullable<SnapTarget>) => {
      if (target.kind === 'floor') return !(cellKey(target.cell) in floors)
      if (target.kind === 'wall') return !(edgeKey(target.cell, target.orientation) in walls)
      return hasFloorAt(target.cell) && !hasFixtureAt(target.cell)
    },
    [floors, walls, hasFloorAt, hasFixtureAt],
  )

  const { target, onPointerMove, onPointerLeave } = useGridSnap(tool, isValid)

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!target) return
      const isRemove = event.button === 2

      if (target.kind === 'floor') {
        if (isRemove) removeFloor(target.cell)
        else if (target.valid) placeFloor(target.cell)
      } else if (target.kind === 'wall') {
        if (isRemove) removeWall(target.cell, target.orientation)
        else if (target.valid) placeWall(target.cell, target.orientation)
      } else if (target.kind === 'fixture') {
        if (isRemove) {
          const removed = Object.values(fixtures).find((f) => f.cell.x === target.cell.x && f.cell.z === target.cell.z)
          removeFixtureAt(target.cell)
          if (removed) {
            removeInventoryFixture(removed.id)
            unassignStaffFixture(removed.id)
          }
        } else if (target.valid) {
          placeFixture(tool as FixtureCategory, target.cell, rotation)
        }
      }
    },
    [
      target,
      tool,
      rotation,
      fixtures,
      placeFloor,
      removeFloor,
      placeWall,
      removeWall,
      placeFixture,
      removeFixtureAt,
      removeInventoryFixture,
      unassignStaffFixture,
    ],
  )

  return (
    <>
      <SkyGradient />
      <StoreLighting directionalPosition={[15, 20, 10]} />
      <OrbitControls
        makeDefault
        target={[GRID_WIDTH / 2, 0, GRID_DEPTH / 2]}
        minDistance={4}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.15}
      />
      <Ground />

      {Array.from({ length: maxLevel + 1 }, (_, level) => (
        <group key={level} position={[0, level * LEVEL_HEIGHT, 0]}>
          <LayoutRenderer level={level} />
        </group>
      ))}

      <group position={[0, activeLevel * LEVEL_HEIGHT, 0]}>
        <GridFloor onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerDown={handlePointerDown} />
        <Ghost
          target={target}
          fixtureCategory={tool === 'shelf' || tool === 'checkout' || tool === 'stairs' ? tool : undefined}
          rotation={rotation}
        />
      </group>

      <CustomersLayer />
      <StaffLayer />
      <SalePopsLayer />
      <LODTestProps />
      <DustMotes areaSize={[GRID_WIDTH, 3.5, GRID_DEPTH]} center={[GRID_WIDTH / 2, 2, GRID_DEPTH / 2]} />
    </>
  )
}
