import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, PointLight } from 'three'
import { cellCenterToWorld } from '../../systems/grid'
import { FIXTURE_DEFINITIONS, type FixtureCategory } from '../../data/fixtureDefinitions'
import type { Cell } from '../../systems/grid'

interface FixtureProps {
  category: FixtureCategory
  cell: Cell
  rotation: number
}

export function Fixture({ category, cell, rotation }: FixtureProps) {
  const def = FIXTURE_DEFINITIONS[category]
  const [x, z] = useMemo(() => cellCenterToWorld(cell), [cell])

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[def.footprint.width * 0.85, def.height, def.footprint.depth * 0.85]} />
        <meshStandardMaterial color={def.color} roughness={0.6} metalness={0.1} />
      </mesh>
      {category === 'checkout' && <CheckoutScanner height={def.height} />}
    </group>
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
