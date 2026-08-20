import { useMemo } from 'react'
import { cellCenterToWorld } from '../../systems/grid'
import { FIXTURE_DEFINITIONS, type FixtureCategory } from '../../data/fixtureDefinitions'
import type { Cell } from '../../systems/grid'

interface FixtureProps {
  category: FixtureCategory
  cell: Cell
  rotation: number
}

export function Fixture({ category, cell, rotation }: FixtureProps) {
  const def = FIXTURE_DEFINITIONS[category]
  const [x, z] = useMemo(() => cellCenterToWorld(cell), [cell])

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[def.footprint.width * 0.85, def.height, def.footprint.depth * 0.85]} />
        <meshStandardMaterial color={def.color} roughness={0.6} metalness={0.1} />
      </mesh>
      {category === 'checkout' && (
        <mesh position={[0, def.height + 0.05, 0.2]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.3]} />
          <meshStandardMaterial color="#1c2733" roughness={0.3} metalness={0.4} />
        </mesh>
      )}
    </group>
  )
}
