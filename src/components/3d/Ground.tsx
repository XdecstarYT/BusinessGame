import { GRID_DEPTH, GRID_WIDTH } from '../../systems/grid'
import { getGroundTexture } from './textures'

/** Neutral exterior ground extending past the buildable grid, so the store
 * doesn't appear to float in a void once the camera pulls back or the
 * player walks to the edge of the lot. */
export function Ground() {
  const size = Math.max(GRID_WIDTH, GRID_DEPTH) * 4

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_WIDTH / 2, -0.02, GRID_DEPTH / 2]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={getGroundTexture(size / 2)} color="#565f6e" roughness={1} />
    </mesh>
  )
}
