import { useMemo } from 'react'
import { CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS, edgeToWorld, type Cell, type WallOrientation } from '../../systems/grid'

interface WallProps {
  cell: Cell
  orientation: WallOrientation
}

export function Wall({ cell, orientation }: WallProps) {
  const { position, rotationY } = useMemo(() => edgeToWorld(cell, orientation), [cell, orientation])
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
      <meshStandardMaterial color="#e8e4da" roughness={0.9} metalness={0} />
    </mesh>
  )
}
