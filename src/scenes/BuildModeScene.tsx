import { useCallback } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { DustMotes } from '../components/3d/DustMotes'
import { GridFloor } from '../components/3d/GridFloor'
import { Ground } from '../components/3d/Ground'
import { LayoutRenderer } from '../components/3d/LayoutRenderer'
import { Ghost } from '../components/3d/Ghost'
import { LODTestProps } from '../components/3d/LODTestProps'
import { SkyGradient } from '../components/3d/SkyGradient'
import { useGridSnap, type SnapTarget } from '../hooks/useGridSnap'
import { useBuildTool } from '../stores/useBuildTool'
import { useStoreLayout } from '../stores/useStoreLayout'
import { GRID_WIDTH, GRID_DEPTH, cellKey, edgeKey } from '../systems/grid'
import type { FixtureCategory } from '../data/fixtureDefinitions'

export function BuildModeScene() {
  const tool = useBuildTool((s) => s.tool)
  const rotation = useBuildTool((s) => s.rotation)

  const floors = useStoreLayout((s) => s.floors)
  const walls = useStoreLayout((s) => s.walls)
  const placeFloor = useStoreLayout((s) => s.placeFloor)
  const removeFloor = useStoreLayout((s) => s.removeFloor)
  const placeWall = useStoreLayout((s) => s.placeWall)
  const removeWall = useStoreLayout((s) => s.removeWall)
  const placeFixture = useStoreLayout((s) => s.placeFixture)
  const removeFixtureAt = useStoreLayout((s) => s.removeFixtureAt)
  const hasFloorAt = useStoreLayout((s) => s.hasFloorAt)
  const hasFixtureAt = useStoreLayout((s) => s.hasFixtureAt)

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
        if (isRemove) removeFixtureAt(target.cell)
        else if (target.valid) placeFixture(tool as FixtureCategory, target.cell, rotation)
      }
    },
    [target, tool, rotation, placeFloor, removeFloor, placeWall, removeWall, placeFixture, removeFixtureAt],
  )

  return (
    <>
      <SkyGradient />
      <ambientLight intensity={0.6} />
      <directionalLight position={[15, 20, 10]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
      <OrbitControls
        makeDefault
        target={[GRID_WIDTH / 2, 0, GRID_DEPTH / 2]}
        minDistance={4}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.15}
      />
      <Ground />
      <GridFloor onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerDown={handlePointerDown} />
      <LayoutRenderer />
      <Ghost target={target} fixtureCategory={tool === 'shelf' || tool === 'checkout' ? tool : undefined} rotation={rotation} />
      <LODTestProps />
      <DustMotes areaSize={[GRID_WIDTH, 3.5, GRID_DEPTH]} center={[GRID_WIDTH / 2, 2, GRID_DEPTH / 2]} />
    </>
  )
}
