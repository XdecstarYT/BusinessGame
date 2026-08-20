import { CELL_SIZE, WALL_HEIGHT } from '../../systems/grid'

const STEP_COUNT = 8
const STEP_HEIGHT = WALL_HEIGHT / STEP_COUNT
const STEP_DEPTH = CELL_SIZE / STEP_COUNT

/** A single-cell staircase, rising the full level height across ascending
 * boxed steps. Connects a "stairs" fixture on level N to the matching cell
 * on level N+1 — the vertical link Walk Mode transitions across. */
export function StairsFixture() {
  return (
    <group>
      {Array.from({ length: STEP_COUNT }, (_, i) => {
        const y = STEP_HEIGHT * (i + 0.5)
        const z = -CELL_SIZE / 2 + STEP_DEPTH * (i + 0.5)
        return (
          <mesh key={i} position={[0, y, z]} castShadow receiveShadow>
            <boxGeometry args={[CELL_SIZE * 0.9, STEP_HEIGHT, STEP_DEPTH]} />
            <meshStandardMaterial color="#6b5b4a" roughness={0.8} />
          </mesh>
        )
      })}
      <mesh position={[-CELL_SIZE * 0.44, WALL_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[0.05, WALL_HEIGHT, CELL_SIZE]} />
        <meshStandardMaterial color="#4a3f33" roughness={0.7} />
      </mesh>
      <mesh position={[CELL_SIZE * 0.44, WALL_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[0.05, WALL_HEIGHT, CELL_SIZE]} />
        <meshStandardMaterial color="#4a3f33" roughness={0.7} />
      </mesh>
    </group>
  )
}
