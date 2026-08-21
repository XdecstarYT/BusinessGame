import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GRID_WIDTH, GRID_DEPTH } from '../../systems/grid'
import { getHeatGrid } from '../../systems/customerSimulation'
import { useAnalytics } from '../../stores/useAnalytics'

const PX_PER_CELL = 4
const UPDATE_INTERVAL = 0.4
const HEAT_VISUAL_MAX = 12

function heatColor(t: number): [number, number, number] {
  if (t < 0.5) {
    const k = t / 0.5
    return [Math.round(80 + k * 175), 220, 60]
  }
  const k = (t - 0.5) / 0.5
  return [255, Math.round(220 - k * 180), Math.max(0, 60 - Math.round(k * 60))]
}

/** Semi-transparent floor overlay showing recent customer traffic density —
 * toggleable via the Analytics panel. Reads the imperative heat grid kept in
 * customerSimulation directly (not through Zustand) and redraws a canvas
 * texture on a throttled interval rather than every frame. */
export function HeatmapOverlay() {
  const show = useAnalytics((s) => s.showHeatmap)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const timerRef = useRef(0)

  if (!canvasRef.current) {
    const canvas = document.createElement('canvas')
    canvas.width = GRID_WIDTH * PX_PER_CELL
    canvas.height = GRID_DEPTH * PX_PER_CELL
    canvasRef.current = canvas
  }
  if (!textureRef.current) {
    textureRef.current = new THREE.CanvasTexture(canvasRef.current)
    textureRef.current.colorSpace = THREE.SRGBColorSpace
  }

  useFrame((_, delta) => {
    if (!show) return
    timerRef.current -= delta
    if (timerRef.current > 0) return
    timerRef.current = UPDATE_INTERVAL

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const [key, value] of getHeatGrid()) {
      const [xs, zs] = key.split(',')
      const x = Number(xs)
      const z = Number(zs)
      const t = Math.min(1, value / HEAT_VISUAL_MAX)
      const [r, g, b] = heatColor(t)
      ctx.fillStyle = `rgba(${r},${g},${b},${0.15 + t * 0.55})`
      ctx.fillRect(x * PX_PER_CELL, z * PX_PER_CELL, PX_PER_CELL, PX_PER_CELL)
    }
    textureRef.current!.needsUpdate = true
  })

  if (!show) return null

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_WIDTH / 2, 0.03, GRID_DEPTH / 2]}>
      <planeGeometry args={[GRID_WIDTH, GRID_DEPTH]} />
      <meshBasicMaterial map={textureRef.current} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
