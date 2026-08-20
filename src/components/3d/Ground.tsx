import { GRID_DEPTH, GRID_WIDTH } from '../../systems/grid'

/** Neutral exterior ground extending past the buildable grid, so the store
 * doesn't appear to float in a void once the camera pulls back or the
 * player walks to the edge of the lot. */
export function Ground() {
  const size = Math.max(GRID_WIDTH, GRID_DEPTH) * 4

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_WIDTH / 2, -0.02, GRID_DEPTH / 2]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#2b2f36" roughness={1} />
    </mesh>
  )
}
