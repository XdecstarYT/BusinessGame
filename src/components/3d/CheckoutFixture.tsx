import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, PointLight } from 'three'

const CABINET_COLOR = '#2e3440'
const COUNTERTOP_COLOR = '#e5e7eb'
const CABINET_HEIGHT = 0.85

interface CheckoutFixtureProps {
  height: number
}

/** A real checkout counter — cabinet base, overhanging countertop, a dark
 * conveyor-belt inset, a raised bagging shelf, and a register/monitor unit
 * with the pulsing scanner glow (the spec's one deliberately real-time-lit
 * element, kept from the earlier placeholder-box version). */
export function CheckoutFixture({ height }: CheckoutFixtureProps) {
  return (
    <group>
      <mesh position={[0, CABINET_HEIGHT / 2, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.85, CABINET_HEIGHT, 0.6]} />
        <meshStandardMaterial color={CABINET_COLOR} roughness={0.55} metalness={0.1} />
      </mesh>

      <mesh position={[0, CABINET_HEIGHT + 0.025, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.05, 0.68]} />
        <meshStandardMaterial color={COUNTERTOP_COLOR} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Conveyor belt inset */}
      <mesh position={[-0.15, CABINET_HEIGHT + 0.052, 0.05]}>
        <boxGeometry args={[0.45, 0.006, 0.35]} />
        <meshStandardMaterial color="#111318" roughness={0.9} />
      </mesh>

      {/* Bagging shelf */}
      <mesh position={[0.32, CABINET_HEIGHT + 0.09, -0.05]} castShadow>
        <boxGeometry args={[0.24, 0.03, 0.5]} />
        <meshStandardMaterial color={COUNTERTOP_COLOR} roughness={0.4} />
      </mesh>

      <RegisterUnit baseY={CABINET_HEIGHT + 0.05} height={height} />
    </group>
  )
}

/** The one deliberately real-time-lit element per the spec (baked lighting
 * everywhere else) — a small pulsing scanner glow that sells the counter as
 * "on" even before checkout logic exists. */
function RegisterUnit({ baseY, height }: { baseY: number; height: number }) {
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

  const standTop = baseY + (height - baseY) * 0.55

  return (
    <group position={[-0.28, 0, 0.18]}>
      <mesh position={[0, (baseY + standTop) / 2, 0]} castShadow>
        <boxGeometry args={[0.06, standTop - baseY, 0.06]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh ref={screenRef} position={[0, standTop + 0.09, 0]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.22, 0.16, 0.02]} />
        <meshStandardMaterial color="#1c2733" emissive="#2dd4ff" emissiveIntensity={0.8} roughness={0.3} metalness={0.4} />
      </mesh>
      <pointLight ref={lightRef} position={[0, standTop + 0.09, 0.05]} color="#2dd4ff" intensity={0.6} distance={1.8} decay={2} />
    </group>
  )
}
