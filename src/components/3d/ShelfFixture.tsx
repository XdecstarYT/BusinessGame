import { useMemo } from 'react'
import { PRODUCT_MAP, SHELF_CAPACITY } from '../../data/products'
import { useInventory } from '../../stores/useInventory'
import { ProductMesh } from './ProductMesh'

const WIDTH = 0.85
const DEPTH = 0.55
const FRAME_COLOR = '#7b828e'
const BOARD_COLOR = '#c9b38c'
const TIER_HEIGHTS = [0.14, 0.58, 1.02]
const ITEMS_PER_TIER = 4
const MAX_FACINGS = TIER_HEIGHTS.length * ITEMS_PER_TIER

interface ShelfFixtureProps {
  fixtureId: string
  height: number
}

/** A real shelving unit — metal uprights, a back panel, three tier boards —
 * with actual product package meshes arranged as facings across the tiers,
 * scaled by how full the shelf is. Empty/unassigned shelves show the bare
 * frame, which reads clearly as "needs stocking." */
export function ShelfFixture({ fixtureId, height }: ShelfFixtureProps) {
  const shelf = useInventory((s) => s.shelfStock[fixtureId])
  const product = shelf?.productId ? PRODUCT_MAP[shelf.productId] : undefined

  const facingCount = useMemo(() => {
    if (!product || !shelf) return 0
    const fillRatio = shelf.quantity / SHELF_CAPACITY
    return Math.min(MAX_FACINGS, Math.max(1, Math.round(fillRatio * MAX_FACINGS)))
  }, [product, shelf])

  const xPositions = useMemo(() => {
    const margin = 0.14
    const span = WIDTH - margin * 2
    return Array.from({ length: ITEMS_PER_TIER }, (_, i) => -span / 2 + (span * i) / (ITEMS_PER_TIER - 1))
  }, [])

  return (
    <group>
      {/* Uprights */}
      <mesh position={[-WIDTH / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, height, DEPTH]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[WIDTH / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, height, DEPTH]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Back panel */}
      <mesh position={[0, height / 2, -DEPTH / 2 + 0.01]} receiveShadow>
        <boxGeometry args={[WIDTH, height, 0.02]} />
        <meshStandardMaterial color="#e2ddd0" roughness={0.85} />
      </mesh>

      {/* Tier boards + product facings */}
      {TIER_HEIGHTS.map((tierY, tierIndex) => {
        const startIndex = tierIndex * ITEMS_PER_TIER
        return (
          <group key={tierIndex}>
            <mesh position={[0, tierY, 0.02]} castShadow receiveShadow>
              <boxGeometry args={[WIDTH - 0.03, 0.03, DEPTH - 0.05]} />
              <meshStandardMaterial color={BOARD_COLOR} roughness={0.7} />
            </mesh>
            {product &&
              xPositions.map((x, i) => {
                const facingIndex = startIndex + i
                if (facingIndex >= facingCount) return null
                return (
                  <group key={i} position={[x, tierY + 0.015, 0.05]}>
                    <ProductMesh product={product} scale={0.9} />
                  </group>
                )
              })}
          </group>
        )
      })}
    </group>
  )
}
