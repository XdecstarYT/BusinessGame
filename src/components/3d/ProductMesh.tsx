import { RoundedBox } from '@react-three/drei'
import type { Product, QualityTier } from '../../data/products'

interface ProductMeshProps {
  product: Product
  scale?: number
}

interface TierFinish {
  /** Subtracted from each material's base roughness — premium items look
   * glossier, budget items look flatter and more matte. */
  roughnessDelta: number
  metalness: number
}

const TIER_FINISH: Record<QualityTier, TierFinish> = {
  budget: { roughnessDelta: -0.12, metalness: 0 },
  standard: { roughnessDelta: 0, metalness: 0.05 },
  premium: { roughnessDelta: 0.12, metalness: 0.35 },
}

function finish(tier: QualityTier, baseRoughness: number) {
  const f = TIER_FINISH[tier]
  return { roughness: Math.min(1, Math.max(0.05, baseRoughness - f.roughnessDelta)), metalness: f.metalness }
}

/** Renders one product as a small composed-primitive package instead of a
 * flat-colored block — the shape is picked from the product's category
 * (bottle/can/box/bag/jar/produce), built entirely from standard geometry
 * and materials (no external assets, no custom shaders — stays compatible
 * with WebGPURenderer's node material system). A wraparound accent label
 * distinguishes bottles/cans/jars, and quality tier subtly tunes the
 * finish (premium items read glossier, budget items flatter). */
export function ProductMesh({ product, scale = 1 }: ProductMeshProps) {
  switch (product.shape) {
    case 'bottle':
      return <BottleMesh product={product} scale={scale} />
    case 'can':
      return <CanMesh product={product} scale={scale} />
    case 'box':
      return <BoxMesh product={product} scale={scale} />
    case 'bag':
      return <BagMesh product={product} scale={scale} />
    case 'jar':
      return <JarMesh product={product} scale={scale} />
    case 'produce':
      return <ProduceMesh product={product} scale={scale} />
  }
}

function BottleMesh({ product, scale }: { product: Product; scale: number }) {
  const body = finish(product.qualityTier, 0.25)
  const label = finish(product.qualityTier, 0.4)
  return (
    <group scale={scale}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.16, 12]} />
        <meshStandardMaterial color={product.color} roughness={body.roughness} metalness={body.metalness} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.0465, 0.0465, 0.05, 12]} />
        <meshStandardMaterial color={product.accentColor} roughness={label.roughness} metalness={label.metalness} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.05, 10]} />
        <meshStandardMaterial color={product.color} roughness={body.roughness} metalness={body.metalness} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 0.225, 0]} castShadow>
        <cylinderGeometry args={[0.021, 0.021, 0.025, 10]} />
        <meshStandardMaterial color={product.accentColor} roughness={label.roughness} />
      </mesh>
    </group>
  )
}

function CanMesh({ product, scale }: { product: Product; scale: number }) {
  const body = finish(product.qualityTier, 0.35)
  const label = finish(product.qualityTier, 0.3)
  return (
    <group scale={scale}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.033, 0.033, 0.12, 14]} />
        <meshStandardMaterial color={product.color} roughness={body.roughness} metalness={0.6 + body.metalness * 0.3} />
      </mesh>
      <mesh position={[0, 0.062, 0]} castShadow>
        <cylinderGeometry args={[0.0335, 0.0335, 0.05, 14]} />
        <meshStandardMaterial color={product.accentColor} roughness={label.roughness} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.121, 0]} castShadow>
        <cylinderGeometry args={[0.033, 0.033, 0.004, 14]} />
        <meshStandardMaterial color={product.accentColor} roughness={label.roughness} metalness={0.7} />
      </mesh>
    </group>
  )
}

function BoxMesh({ product, scale }: { product: Product; scale: number }) {
  const body = finish(product.qualityTier, 0.7)
  const label = finish(product.qualityTier, 0.6)
  return (
    <group scale={scale}>
      <mesh position={[0, 0.065, 0]} castShadow>
        <boxGeometry args={[0.09, 0.13, 0.055]} />
        <meshStandardMaterial color={product.color} roughness={body.roughness} metalness={body.metalness * 0.5} />
      </mesh>
      <mesh position={[0, 0.075, 0.0285]} castShadow>
        <boxGeometry args={[0.065, 0.06, 0.004]} />
        <meshStandardMaterial color={product.accentColor} roughness={label.roughness} metalness={label.metalness * 0.5} />
      </mesh>
      {product.qualityTier === 'premium' && (
        <mesh position={[0, 0.12, 0.0295]} castShadow>
          <boxGeometry args={[0.065, 0.008, 0.002]} />
          <meshStandardMaterial color="#e8d29a" roughness={0.25} metalness={0.6} />
        </mesh>
      )}
    </group>
  )
}

function BagMesh({ product, scale }: { product: Product; scale: number }) {
  const body = finish(product.qualityTier, 0.6)
  const label = finish(product.qualityTier, 0.5)
  return (
    <group scale={scale}>
      <RoundedBox args={[0.09, 0.12, 0.05]} radius={0.025} smoothness={2} position={[0, 0.06, 0]} castShadow>
        <meshStandardMaterial color={product.color} roughness={body.roughness} metalness={body.metalness * 0.3} />
      </RoundedBox>
      <mesh position={[0, 0.09, 0.026]} castShadow>
        <boxGeometry args={[0.06, 0.035, 0.003]} />
        <meshStandardMaterial color={product.accentColor} roughness={label.roughness} metalness={label.metalness * 0.3} />
      </mesh>
    </group>
  )
}

function JarMesh({ product, scale }: { product: Product; scale: number }) {
  const body = finish(product.qualityTier, 0.3)
  const lid = finish(product.qualityTier, 0.35)
  return (
    <group scale={scale}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.09, 14]} />
        <meshStandardMaterial color={product.color} roughness={body.roughness} metalness={body.metalness} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.0465, 0.0415, 0.03, 14]} />
        <meshStandardMaterial color={product.accentColor} roughness={body.roughness} metalness={body.metalness * 0.5} />
      </mesh>
      <mesh position={[0, 0.102, 0]} castShadow>
        <cylinderGeometry args={[0.047, 0.047, 0.025, 14]} />
        <meshStandardMaterial color={product.accentColor} roughness={lid.roughness} metalness={0.3 + lid.metalness} />
      </mesh>
    </group>
  )
}

function ProduceMesh({ product, scale }: { product: Product; scale: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.035, 0]} castShadow>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color={product.color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.006, 0.015, 6]} />
        <meshStandardMaterial color="#5a4322" roughness={0.8} />
      </mesh>
    </group>
  )
}
