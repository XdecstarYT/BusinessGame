import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import { CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS, cellCenterToWorld, edgeToWorld } from '../../systems/grid'
import { FIXTURE_DEFINITIONS, type FixtureCategory } from '../../data/fixtureDefinitions'
import type { SnapTarget } from '../../hooks/useGridSnap'

interface GhostProps {
  target: SnapTarget
  fixtureCategory?: FixtureCategory
  rotation: number
}

const VALID_COLOR = '#4ade80'
const INVALID_COLOR = '#f87171'

export function Ghost({ target, fixtureCategory, rotation }: GhostProps) {
  const geometry = useGhostGeometry(target, fixtureCategory)
  const meshRef = useRef<Mesh>(null)

  // Gentle opacity pulse so the placement cursor reads as "live" feedback
  // rather than a flat, inert overlay.
  useFrame(({ clock }) => {
    const material = meshRef.current?.material as MeshStandardMaterial | undefined
    if (material) material.opacity = 0.35 + Math.sin(clock.elapsedTime * 4) * 0.15
  })

  if (!target || !geometry) return null

  const color = target.valid ? VALID_COLOR : INVALID_COLOR

  return (
    <group position={geometry.position} rotation={[0, geometry.rotationY ?? rotation, 0]}>
      <mesh ref={meshRef}>
        {geometry.type === 'wall' ? (
          <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        ) : geometry.type === 'floor' ? (
          <boxGeometry args={[CELL_SIZE * 0.98, 0.05, CELL_SIZE * 0.98]} />
        ) : (
          <boxGeometry args={[geometry.footprint * 0.85, geometry.height, geometry.footprint * 0.85]} />
        )}
        <meshStandardMaterial color={color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}

function useGhostGeometry(target: SnapTarget, fixtureCategory?: FixtureCategory) {
  return useMemo(() => {
    if (!target) return null
    if (target.kind === 'wall') {
      const { position } = edgeToWorld(target.cell, target.orientation)
      const { rotationY } = edgeToWorld(target.cell, target.orientation)
      return { type: 'wall' as const, position, rotationY }
    }
    if (target.kind === 'floor') {
      const [x, z] = cellCenterToWorld(target.cell)
      return { type: 'floor' as const, position: [x, 0.03, z] as [number, number, number] }
    }
    const [x, z] = cellCenterToWorld(target.cell)
    const def = fixtureCategory ? FIXTURE_DEFINITIONS[fixtureCategory] : undefined
    return {
      type: 'fixture' as const,
      position: [x, (def?.height ?? 1) / 2, z] as [number, number, number],
      footprint: 1,
      height: def?.height ?? 1,
    }
  }, [target, fixtureCategory])
}
