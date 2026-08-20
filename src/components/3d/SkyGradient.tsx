import { useMemo } from 'react'
import * as THREE from 'three'

const TOP_COLOR = new THREE.Color('#4a90d9')
const HORIZON_COLOR = new THREE.Color('#dce9f5')

/**
 * A vertex-colored backdrop sphere instead of drei's <Sky>. WebGPURenderer's
 * node-based material system can't consume raw ShaderMaterial (three-stdlib's
 * Sky implementation, which <Sky> wraps) — MeshBasicMaterial + vertex colors
 * is fully compatible and costs nothing at runtime.
 */
export function SkyGradient() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(500, 32, 16)
    const position = geo.attributes.position
    const colors = new Float32Array(position.count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < position.count; i++) {
      const t = THREE.MathUtils.clamp(position.getY(i) / 500, 0, 1)
      color.copy(HORIZON_COLOR).lerp(TOP_COLOR, Math.pow(t, 0.7))
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  )
}
