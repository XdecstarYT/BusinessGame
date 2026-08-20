import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { HUD } from './components/ui/HUD'
import { SimulationDriver } from './components/3d/SimulationDriver'
import { BuildModeScene } from './scenes/BuildModeScene'
import { WalkModeScene } from './scenes/WalkModeScene'
import { CityMapScene } from './scenes/CityMapScene'
import { useGameMode, type GameMode } from './stores/useGameMode'
import { GRID_WIDTH, GRID_DEPTH } from './systems/grid'

const BUILD_CAMERA_POSITION: [number, number, number] = [
  GRID_WIDTH / 2 + 14,
  16,
  GRID_DEPTH / 2 + 14,
]

const CITY_CAMERA_POSITION: [number, number, number] = [40, 46, 40]

/** Resets the shared camera to a sensible orbit position whenever we switch
 * into Build or City mode (Walk Mode drives the camera manually every frame). */
function CameraModeRig({ mode }: { mode: GameMode }) {
  const { camera } = useThree()

  useEffect(() => {
    if (mode === 'build') {
      camera.position.set(...BUILD_CAMERA_POSITION)
      camera.lookAt(GRID_WIDTH / 2, 0, GRID_DEPTH / 2)
    } else if (mode === 'city') {
      camera.position.set(...CITY_CAMERA_POSITION)
      camera.lookAt(0, 0, 0)
    }
  }, [mode, camera])

  return null
}

function ConfigureRenderer() {
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.0
    gl.outputColorSpace = THREE.SRGBColorSpace
    if ('shadowMap' in gl) {
      gl.shadowMap.enabled = true
      gl.shadowMap.type = THREE.PCFSoftShadowMap
    }
  }, [gl])

  return null
}

const WEBGPU_ERROR_PATTERN = /GPUTexture|GPUDevice|GPUValidationError|GPUAdapter|GPUBuffer|GPUPipeline|WebGPUBackend|WebGPURenderer/i

export default function App() {
  const mode = useGameMode((s) => s.mode)

  // Some browsers advertise `navigator.gpu` (so three.js's built-in
  // getFallback() never triggers) but throw at render time on API mismatches.
  // Watching for that and forcing a remount onto the WebGL2 backend is the
  // application-level half of the "automatic fallback" the spec requires.
  const [forceWebGL, setForceWebGL] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)

  useEffect(() => {
    if (forceWebGL) return
    const handleError = (event: ErrorEvent) => {
      if (WEBGPU_ERROR_PATTERN.test(event.message ?? '')) {
        console.warn('[Retail Empire] WebGPU render error detected — falling back to WebGL renderer.', event.message)
        setForceWebGL(true)
        setCanvasKey((k) => k + 1)
      }
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [forceWebGL])

  return (
    <div className="relative w-full h-full" onContextMenu={(e) => e.preventDefault()}>
      <Canvas
        key={canvasKey}
        gl={async (props) => {
          const renderer = new WebGPURenderer({
            canvas: props.canvas as HTMLCanvasElement,
            antialias: true,
            forceWebGL,
          })
          await renderer.init()
          return renderer
        }}
        shadows
        camera={{ position: BUILD_CAMERA_POSITION, fov: 50, near: 0.1, far: 1200 }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#c9d6e3', 40, 140]} />
          <ConfigureRenderer />
          <CameraModeRig mode={mode} />
          <SimulationDriver />
          {mode === 'build' && <BuildModeScene />}
          {mode === 'walk' && <WalkModeScene />}
          {mode === 'city' && <CityMapScene />}
        </Suspense>
      </Canvas>
      <HUD />
    </div>
  )
}
