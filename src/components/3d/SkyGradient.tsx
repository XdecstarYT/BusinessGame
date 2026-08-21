import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { currentGameHour } from '../../stores/useGameClock'
import { skyStateForHour } from '../../systems/dayNightCycle'

/**
 * A vertex-colored backdrop sphere instead of drei's <Sky>. WebGPURenderer's
 * node-based material system can't consume raw ShaderMaterial (three-stdlib's
 * Sky implementation, which <Sky> wraps) — MeshBasicMaterial + vertex colors
 * is fully compatible and costs nothing at runtime.
 *
 * Colors drift across store hours (dawn/midday/dusk) rather than staying
 * static, driven by the game clock — see systems/dayNightCycle.ts. The
 * geometry (with its color attribute) is built once in useMemo so it
 * survives parent re-renders; useFrame mutates the existing attribute's
 * array in place rather than recreating it.
 */
export function SkyGradient() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(500, 32, 16)
    const position = geo.attributes.position
    const colors = new Float32Array(position.count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  const heightFactors = useMemo(() => {
    const position = geometry.attributes.position
    const factors = new Float32Array(position.count)
    for (let i = 0; i < position.count; i++) {
      factors[i] = Math.pow(THREE.MathUtils.clamp(position.getY(i) / 500, 0, 1), 0.7)
    }
    return factors
  }, [geometry])

  const lastHourRef = useRef<number | null>(null)

  const applySky = (hour: number) => {
    const { skyTop, skyHorizon } = skyStateForHour(hour)
    const top = new THREE.Color(skyTop)
    const horizon = new THREE.Color(skyHorizon)
    const color = new THREE.Color()
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute
    const colors = colorAttr.array as Float32Array
    for (let i = 0; i < heightFactors.length; i++) {
      color.copy(horizon).lerp(top, heightFactors[i])
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    colorAttr.needsUpdate = true
  }

  if (lastHourRef.current === null) {
    lastHourRef.current = currentGameHour()
    applySky(lastHourRef.current)
  }

  useFrame(() => {
    const hour = currentGameHour()
    if (Math.abs(hour - (lastHourRef.current ?? hour)) < 0.03) return
    lastHourRef.current = hour
    applySky(hour)
  })

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  )
}
