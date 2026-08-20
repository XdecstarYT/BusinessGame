import { RigidBody } from '@react-three/rapier'
import { EMPTY_LAYOUT, useStoreLayout } from '../../stores/useStoreLayout'
import { Floor } from './Floor'
import { Wall } from './Wall'
import { Fixture } from './Fixture'

interface LayoutRendererProps {
  withPhysics?: boolean
  /** Which building level to render — 0 (ground) by default. */
  level?: number
}

/** Renders all placed floors/walls/fixtures for one level. In Walk Mode
 * (withPhysics) walls and fixtures get fixed rigid-body colliders so the
 * player can't walk through them. */
export function LayoutRenderer({ withPhysics = false, level = 0 }: LayoutRendererProps) {
  const floors = useStoreLayout((s) => (level === 0 ? s.floors : (s.upperLevels[level]?.floors ?? EMPTY_LAYOUT.floors)))
  const walls = useStoreLayout((s) => (level === 0 ? s.walls : (s.upperLevels[level]?.walls ?? EMPTY_LAYOUT.walls)))
  const fixtures = useStoreLayout((s) => (level === 0 ? s.fixtures : (s.upperLevels[level]?.fixtures ?? EMPTY_LAYOUT.fixtures)))

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
            <Fixture id={fixture.id} category={fixture.category} cell={fixture.cell} rotation={fixture.rotation} />
          </RigidBody>
        ) : (
          <Fixture id={fixture.id} key={fixture.id} category={fixture.category} cell={fixture.cell} rotation={fixture.rotation} />
        ),
      )}
    </group>
  )
}
