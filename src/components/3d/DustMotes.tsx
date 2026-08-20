import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DustMotesProps {
  count?: number
  areaSize?: [number, number, number]
  center?: [number, number, number]
}

interface MoteSeed {
  base: THREE.Vector3
  speed: number
  phase: number
}

/**
 * Drifting ambient dust, standing in for drei's <Sparkles> — that component's
 * glow shader is a raw ShaderMaterial and isn't compatible with
 * WebGPURenderer's node-based materials. Plain PointsMaterial + per-frame
 * position drift gets the same "air is alive" read without it.
 */
export function DustMotes({ count = 50, areaSize = [24, 3.5, 24], center = [12, 2, 12] }: DustMotesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const seeds = useMemo<MoteSeed[]>(
    () =>
      Array.from({ length: count }, () => ({
        base: new THREE.Vector3(
          (Math.random() - 0.5) * areaSize[0],
          Math.random() * areaSize[1],
          (Math.random() - 0.5) * areaSize[2],
        ),
        speed: 0.15 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, areaSize[0], areaSize[1], areaSize[2]],
  )

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return geo
  }, [count])

  useFrame(({ clock }) => {
    const points = pointsRef.current
    if (!points) return
    const positions = points.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime

    for (let i = 0; i < seeds.length; i++) {
      const { base, speed, phase } = seeds[i]
      positions.setXYZ(
        i,
        base.x + Math.sin(t * speed + phase) * 0.6,
        base.y + Math.sin(t * speed * 0.7 + phase) * 0.3,
        base.z + Math.cos(t * speed + phase) * 0.6,
      )
    }
    positions.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry} position={center}>
      <pointsMaterial color="#ffedc2" size={0.05} transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}
