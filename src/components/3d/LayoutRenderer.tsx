import { RigidBody } from '@react-three/rapier'
import { useStoreLayout } from '../../stores/useStoreLayout'
import { Floor } from './Floor'
import { Wall } from './Wall'
import { Fixture } from './Fixture'

interface LayoutRendererProps {
  withPhysics?: boolean
}

/** Renders all placed floors/walls/fixtures. In Walk Mode (withPhysics) walls and
 * fixtures get fixed rigid-body colliders so the player can't walk through them. */
export function LayoutRenderer({ withPhysics = false }: LayoutRendererProps) {
  const floors = useStoreLayout((s) => s.floors)
  const walls = useStoreLayout((s) => s.walls)
  const fixtures = useStoreLayout((s) => s.fixtures)

  return (
    <group>
      {Object.entries(floors).map(([key, cell]) => (
        <Floor key={key} cell={cell} />
      ))}

      {Object.entries(walls).map(([key, wall]) =>
        withPhysics ? (
          <RigidBody key={key} type="fixed" colliders="cuboid">
            <Wall cell={wall.cell} orientation={wall.orientation} />
          </RigidBody>
        ) : (
          <Wall key={key} cell={wall.cell} orientation={wall.orientation} />
        ),
      )}

      {Object.values(fixtures).map((fixture) =>
        withPhysics ? (
          <RigidBody key={fixture.id} type="fixed" colliders="cuboid">
            <Fixture category={fixture.category} cell={fixture.cell} rotation={fixture.rotation} />
          </RigidBody>
        ) : (
          <Fixture key={fixture.id} category={fixture.category} cell={fixture.cell} rotation={fixture.rotation} />
        ),
      )}
    </group>
  )
}
