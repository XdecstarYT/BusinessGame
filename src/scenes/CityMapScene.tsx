import { useState } from 'react'
import { Html, OrbitControls, RoundedBox } from '@react-three/drei'
import { NEIGHBORHOODS } from '../data/neighborhoods'
import { useCityMap } from '../stores/useCityMap'
import { SkyGradient } from '../components/3d/SkyGradient'
import { StoreLighting } from '../components/3d/StoreLighting'

const PLOT_SIZE = 12
const PLOT_HEIGHT = 1.2

function PlotBlock({ id, position, color }: { id: string; position: [number, number]; color: string }) {
  const owned = useCityMap((s) => s.isOwned(id))
  const selected = useCityMap((s) => s.selectedPlotId === id)
  const selectPlot = useCityMap((s) => s.selectPlot)
  const [hovered, setHovered] = useState(false)

  const plot = NEIGHBORHOODS.find((p) => p.id === id)!
  const height = owned ? PLOT_HEIGHT * 1.6 : PLOT_HEIGHT
  const displayColor = owned ? '#22c55e' : color

  return (
    <group position={[position[0], 0, position[1]]}>
      <RoundedBox
        args={[PLOT_SIZE, height, PLOT_SIZE]}
        radius={0.3}
        smoothness={2}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          selectPlot(id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={displayColor} roughness={0.7} emissive={selected ? '#fbbf24' : '#000000'} emissiveIntensity={selected ? 0.35 : 0} />
      </RoundedBox>

      {(hovered || selected) && (
        <Html position={[0, height + 1.4, 0]} center distanceFactor={22} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap text-xs font-semibold text-white bg-black/70 rounded-full px-3 py-1 shadow">
            {plot.name}
            {owned ? ' · Owned' : ''}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Low-fidelity "toy town" map — coarse colored blocks, not modeled
 * buildings. Selecting/acquiring a plot is browsing + unlocking a second
 * location, not operating a live parallel store; that's the Phase 7
 * Corporate/Multi-Store layer.
 */
export function CityMapScene() {
  return (
    <>
      <SkyGradient />
      <StoreLighting directionalPosition={[20, 25, 15]} />
      <OrbitControls makeDefault target={[0, 0, 0]} minDistance={20} maxDistance={90} maxPolarAngle={Math.PI / 2.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#3f4a58" roughness={1} />
      </mesh>

      {NEIGHBORHOODS.map((plot) => (
        <PlotBlock key={plot.id} id={plot.id} position={plot.position} color={plot.color} />
      ))}
    </>
  )
}
