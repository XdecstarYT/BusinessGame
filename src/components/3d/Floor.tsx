import { useMemo } from 'react'
import { CELL_SIZE, cellCenterToWorld, type Cell } from '../../systems/grid'
import { getFloorTileTexture } from './textures'

interface FloorProps {
  cell: Cell
}

export function Floor({ cell }: FloorProps) {
  const [x, z] = useMemo(() => cellCenterToWorld(cell), [cell])
  return (
    <mesh position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[CELL_SIZE * 0.98, CELL_SIZE * 0.98]} />
      <meshStandardMaterial map={getFloorTileTexture()} color="#ffffff" roughness={0.85} metalness={0} />
    </mesh>
  )
}
