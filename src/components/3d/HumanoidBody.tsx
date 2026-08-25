import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

interface HumanoidBodyProps {
  shirtColor: string
  skinTone?: string
  pantsColor?: string
  shirtRef?: (m: Mesh | null) => void
  /** Animates a leg/arm walk-swing every frame — only worth the per-instance
   * useFrame cost for NPCs that are actually ambulatory outdoors (city
   * pedestrians); in-store customers/staff stay still-limbed. */
  walking?: boolean
  phase?: number
}

/** Shared low-poly person rig used by CustomerNPC, StaffNPC, and
 * PedestrianNPC: two leg cylinders, a torso capsule (exposed via shirtRef so
 * callers can recolor it per-instance without React state), two arm
 * cylinders, and a head sphere — a more human silhouette than a single
 * capsule while staying cheap enough for a pooled crowd. */
export function HumanoidBody({ shirtColor, skinTone = '#e8c39e', pantsColor = '#2e3542', shirtRef, walking = false, phase = 0 }: HumanoidBodyProps) {
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const t = useRef(phase)

  useFrame((_, delta) => {
    if (!walking) return
    t.current += delta * 6.5
    const swing = Math.sin(t.current) * 0.55
    if (leftLeg.current) leftLeg.current.rotation.x = swing
    if (rightLeg.current) rightLeg.current.rotation.x = -swing
    if (leftArm.current) leftArm.current.rotation.x = -swing
    if (rightArm.current) rightArm.current.rotation.x = swing
  })

  return (
    <group>
      <group ref={leftLeg} position={[0.09, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[-0.09, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.06, 0.5, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </mesh>
      </group>

      <mesh ref={shirtRef} position={[0, 0.76, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.38, 4, 8]} />
        <meshStandardMaterial color={shirtColor} roughness={0.65} />
      </mesh>

      <group ref={leftArm} position={[0.26, 0.95, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.42, 8]} />
          <meshStandardMaterial color={shirtColor} roughness={0.65} />
        </mesh>
      </group>
      <group ref={rightArm} position={[-0.26, 0.95, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.42, 8]} />
          <meshStandardMaterial color={shirtColor} roughness={0.65} />
        </mesh>
      </group>

      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color={skinTone} roughness={0.6} />
      </mesh>
    </group>
  )
}
