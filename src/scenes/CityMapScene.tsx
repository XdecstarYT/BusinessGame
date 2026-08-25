import { useMemo, useState } from 'react'
import { Html, OrbitControls, RoundedBox } from '@react-three/drei'
import { NEIGHBORHOODS } from '../data/neighborhoods'
import { INDUSTRIAL_DISTRICT } from '../data/cityLayout'
import { SUPPLIER_MAP } from '../data/suppliers'
import { useCityMap } from '../stores/useCityMap'
import { useCompetitors } from '../stores/useCompetitors'
import { COMPETITOR_CHAIN_MAP } from '../data/competitors'
import { SkyGradient } from '../components/3d/SkyGradient'
import { StoreLighting } from '../components/3d/StoreLighting'
import { CityRoads } from '../components/3d/CityRoads'
import { CityTraffic } from '../components/3d/CityTraffic'
import { CityPedestrians } from '../components/3d/CityPedestrians'
import { WarehouseBuilding } from '../components/3d/WarehouseBuilding'
import { FactoryBuilding } from '../components/3d/FactoryBuilding'
import { DeliveryTrucksLayer } from '../components/3d/DeliveryTrucksLayer'

const PLOT_SIZE = 12
const FLOOR_HEIGHT = 2.4

function floorCountForPlot(footTraffic: number, owned: boolean): number {
  const base = 2 + Math.round(footTraffic / 28)
  return owned ? base + 1 : base
}

function WindowBand({ y, width, depth, color }: { y: number; width: number; depth: number; color: string }) {
  const inset = 0.15
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0, depth / 2 + 0.02]}>
        <boxGeometry args={[width - inset * 2, 0.28, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -(depth / 2 + 0.02)]}>
        <boxGeometry args={[width - inset * 2, 0.28, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
      <mesh position={[width / 2 + 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth - inset * 2, 0.28, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
      <mesh position={[-(width / 2 + 0.02), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth - inset * 2, 0.28, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
    </group>
  )
}

function PlotBuilding({ id, position, color }: { id: string; position: [number, number]; color: string }) {
  const owned = useCityMap((s) => s.isOwned(id))
  const selected = useCityMap((s) => s.selectedPlotId === id)
  const selectPlot = useCityMap((s) => s.selectPlot)
  const presence = useCompetitors((s) => s.presences[id])
  const [hovered, setHovered] = useState(false)

  const plot = NEIGHBORHOODS.find((p) => p.id === id)!
  const chain = presence ? COMPETITOR_CHAIN_MAP[presence.chainId] : undefined
  const floors = floorCountForPlot(plot.footTraffic, owned)
  const totalHeight = floors * FLOOR_HEIGHT
  const displayColor = owned ? '#1f8a4c' : color
  const windowColor = owned ? '#a7f3d0' : chain ? '#fde68a' : '#dbeafe'

  const windowYs = useMemo(() => {
    const ys: number[] = []
    for (let f = 0; f < floors; f++) ys.push(f * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.62)
    return ys
  }, [floors])

  return (
    <group position={[position[0], 0, position[1]]}>
      <RoundedBox
        args={[PLOT_SIZE, totalHeight, PLOT_SIZE]}
        radius={0.3}
        smoothness={2}
        position={[0, totalHeight / 2, 0]}
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

      {windowYs.map((y, i) => (
        <WindowBand key={i} y={y} width={PLOT_SIZE} depth={PLOT_SIZE} color={windowColor} />
      ))}

      <mesh position={[0, totalHeight + 0.15, 0]} castShadow>
        <boxGeometry args={[PLOT_SIZE * 0.86, 0.3, PLOT_SIZE * 0.86]} />
        <meshStandardMaterial color="#20232b" roughness={0.9} />
      </mesh>

      <mesh position={[0, totalHeight + 0.55, PLOT_SIZE / 2 - 1.6]} castShadow>
        <boxGeometry args={[3.4, 0.7, 0.15]} />
        <meshStandardMaterial color={owned ? '#22c55e' : chain ? chain.color : '#4b5563'} roughness={0.5} />
      </mesh>

      {!owned && chain && (
        <mesh position={[PLOT_SIZE / 2 - 1.2, totalHeight + 0.9, PLOT_SIZE / 2 - 1.2]} castShadow>
          <coneGeometry args={[0.5, 1.8, 4]} />
          <meshStandardMaterial color={chain.color} roughness={0.5} />
        </mesh>
      )}

      {(hovered || selected) && (
        <Html position={[0, totalHeight + 1.6, 0]} center distanceFactor={22} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap text-xs font-semibold text-white bg-black/70 rounded-full px-3 py-1 shadow">
            {plot.name}
            {owned ? ' · Your Store' : chain ? ` · ${chain.name}` : ''}
          </div>
        </Html>
      )}
    </group>
  )
}

function IndustrialDistrict() {
  return (
    <group>
      {INDUSTRIAL_DISTRICT.map((building) => {
        const supplier = SUPPLIER_MAP[building.supplierId]
        if (!supplier) return null
        const label = supplier.name
        const color = building.kind === 'warehouse' ? '#6b7280' : '#5b6472'
        return (
          <group key={building.supplierId} position={[building.position[0], 0, building.position[1]]}>
            {building.kind === 'warehouse' ? <WarehouseBuilding color={color} label={label} /> : <FactoryBuilding color={color} label={label} />}
          </group>
        )
      })}
    </group>
  )
}

/**
 * A real (if stylized, low-poly) city: a road grid with looping traffic and
 * sidewalk pedestrians, multi-story plot buildings with lit window bands and
 * chain signage, an industrial district of warehouse/factory buildings — one
 * per supplier from data/suppliers.ts — and delivery trucks that visibly
 * drive from a supplier's building to the home store whenever a supply order
 * is placed (see systems/deliveryTruckSim.ts). Acquired plots still run
 * under useCorporateHQ's abstracted formula-based daily P&L rather than a
 * full second-store simulation — the buildings are the city coming to life
 * around that economy, not a second simulated store front.
 */
export function CityMapScene() {
  return (
    <>
      <SkyGradient />
      <StoreLighting directionalPosition={[20, 25, 15]} />
      <OrbitControls makeDefault target={[0, 0, -8]} minDistance={20} maxDistance={130} maxPolarAngle={Math.PI / 2.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -12]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#3f4a58" roughness={1} />
      </mesh>

      <CityRoads />
      <CityTraffic />
      <CityPedestrians />
      <DeliveryTrucksLayer />
      <IndustrialDistrict />

      {NEIGHBORHOODS.map((plot) => (
        <PlotBuilding key={plot.id} id={plot.id} position={plot.position} color={plot.color} />
      ))}
    </>
  )
}
