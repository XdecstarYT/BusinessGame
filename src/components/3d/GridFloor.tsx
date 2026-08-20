import type { ThreeEvent } from '@react-three/fiber'
import { GRID_DEPTH, GRID_WIDTH } from '../../systems/grid'

interface GridFloorProps {
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void
  onPointerLeave: () => void
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void
}

/** Invisible interaction plane the build tool raycasts against, plus a visible grid line overlay. */
export function GridFloor({ onPointerMove, onPointerLeave, onPointerDown }: GridFloorProps) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GRID_WIDTH / 2, -0.001, GRID_DEPTH / 2]}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <planeGeometry args={[GRID_WIDTH, GRID_DEPTH]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <gridHelper args={[Math.max(GRID_WIDTH, GRID_DEPTH), Math.max(GRID_WIDTH, GRID_DEPTH), '#555', '#333']} position={[GRID_WIDTH / 2, 0, GRID_DEPTH / 2]} />
    </group>
  )
}
