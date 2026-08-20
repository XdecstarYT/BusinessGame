import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, PointLight } from 'three'
import { cellCenterToWorld } from '../../systems/grid'
import { FIXTURE_DEFINITIONS, type FixtureCategory } from '../../data/fixtureDefinitions'
import type { Cell } from '../../systems/grid'
import { PRODUCT_MAP, SHELF_CAPACITY } from '../../data/products'
import { useInventory } from '../../stores/useInventory'

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
      <mesh position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[def.footprint.width * 0.85, def.height, def.footprint.depth * 0.85]} />
        <meshStandardMaterial color={def.color} roughness={0.6} metalness={0.1} />
      </mesh>
      {category === 'checkout' && <CheckoutScanner height={def.height} />}
      {category === 'shelf' && <ShelfStockIndicator fixtureId={id} shelfHeight={def.height} />}
    </group>
  )
}

/** Shows what's actually stocked on the shelf — a colored block sized by
 * fill ratio, or a dark empty plate when nothing's assigned yet. Ties the
 * inventory system back into the 3D view instead of leaving stock invisible. */
function ShelfStockIndicator({ fixtureId, shelfHeight }: { fixtureId: string; shelfHeight: number }) {
  const shelf = useInventory((s) => s.shelfStock[fixtureId])
  const product = shelf?.productId ? PRODUCT_MAP[shelf.productId] : undefined

  if (!product) {
    return (
      <mesh position={[0, shelfHeight + 0.015, 0]}>
        <boxGeometry args={[0.6, 0.03, 0.6]} />
        <meshStandardMaterial color="#555b66" roughness={0.9} />
      </mesh>
    )
  }

  const fillRatio = shelf ? shelf.quantity / SHELF_CAPACITY : 0
  const blockHeight = Math.max(fillRatio, 0.06) * 0.5

  return (
    <mesh position={[0, shelfHeight + blockHeight / 2, 0]} castShadow>
      <boxGeometry args={[0.6, blockHeight, 0.6]} />
      <meshStandardMaterial color={product.color} roughness={0.55} />
    </mesh>
  )
}

/** The one deliberately real-time-lit element per the spec (baked lighting
 * everywhere else) — a small pulsing scanner glow that sells the counter as
 * "on" even before checkout logic exists. */
function CheckoutScanner({ height }: { height: number }) {
  const screenRef = useRef<Mesh>(null)
  const lightRef = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 2.4) * 0.45
    const screenMat = screenRef.current?.material
    if (screenMat && !Array.isArray(screenMat) && 'emissiveIntensity' in screenMat) {
      screenMat.emissiveIntensity = 0.4 + pulse * 1.1
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.3 + pulse * 0.6
    }
  })

  return (
    <>
      <mesh ref={screenRef} position={[0, height + 0.05, 0.2]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#1c2733" emissive="#2dd4ff" emissiveIntensity={0.8} roughness={0.3} metalness={0.4} />
      </mesh>
      <pointLight ref={lightRef} position={[0, height + 0.15, 0.2]} color="#2dd4ff" intensity={0.6} distance={1.8} decay={2} />
    </>
  )
}
