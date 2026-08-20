import { useMemo } from 'react'
import { cellCenterToWorld } from '../../systems/grid'
import { FIXTURE_DEFINITIONS, type FixtureCategory } from '../../data/fixtureDefinitions'
import type { Cell } from '../../systems/grid'
import { CheckoutFixture } from './CheckoutFixture'
import { ShelfFixture } from './ShelfFixture'

interface FixtureProps {
  id: string
  category: FixtureCategory
  cell: Cell
  rotation: number
}

export function Fixture({ id, category, cell, rotation }: FixtureProps) {
  const def = FIXTURE_DEFINITIONS[category]
  const [x, z] = useMemo(() => cellCenterToWorld(cell), [cell])

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {category === 'shelf' && <ShelfFixture fixtureId={id} height={def.height} />}
      {category === 'checkout' && <CheckoutFixture height={def.height} />}
    </group>
  )
}
