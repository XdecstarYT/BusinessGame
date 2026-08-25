import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PEDESTRIAN_ROUTES } from '../../data/cityLayout'
import { buildRouteGeometry, sampleRoute } from '../../systems/cityRoutes'
import { PedestrianNPC } from './PedestrianNPC'

const SHIRT_COLORS = ['#e0654f', '#4f8de0', '#e0c04f', '#4fe0a3', '#a34fe0', '#e04f9e', '#4fbfe0', '#8f9ba8']
const SKIN_TONES = ['#e8c39e', '#c98f5c', '#8a5a3a', '#f0d3ad', '#734330']
const PANTS_COLORS = ['#23262e', '#33404f', '#4a3a2e', '#2e3542']
const WALKERS_PER_ROUTE = 2
const SPEED_MIN = 0.9
const SPEED_MAX = 1.5

interface WalkerInstance {
  routeIndex: number
  reverse: boolean
  speed: number
  offset: number
  shirtColor: string
  pantsColor: string
  skinTone: string
  phase: number
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Ambient sidewalk crowd: a couple of pedestrians looping the block around
 * every plot, purely decorative (no gameplay coupling) and positioned
 * imperatively for the same reason as CityTraffic. */
export function CityPedestrians() {
  const routeGeometries = useMemo(() => PEDESTRIAN_ROUTES.map(buildRouteGeometry), [])

  const walkers = useMemo<WalkerInstance[]>(() => {
    const list: WalkerInstance[] = []
    routeGeometries.forEach((geo, routeIndex) => {
      for (let i = 0; i < WALKERS_PER_ROUTE; i++) {
        list.push({
          routeIndex,
          reverse: i % 2 === 1,
          speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
          offset: (geo.total / WALKERS_PER_ROUTE) * i + Math.random() * 3,
          shirtColor: pick(SHIRT_COLORS),
          pantsColor: pick(PANTS_COLORS),
          skinTone: pick(SKIN_TONES),
          phase: Math.random() * Math.PI * 2,
        })
      }
    })
    return list
  }, [routeGeometries])

  const groupRefs = useRef<(Group | null)[]>([])
  const distances = useRef<number[]>(walkers.map((w) => w.offset))

  useFrame((_, delta) => {
    for (let i = 0; i < walkers.length; i++) {
      const walker = walkers[i]
      const geo = routeGeometries[walker.routeIndex]
      const dir = walker.reverse ? -1 : 1
      distances.current[i] += walker.speed * delta * dir
      const { x, z, heading } = sampleRoute(geo, distances.current[i])
      const group = groupRefs.current[i]
      if (!group) continue
      group.position.set(x, 0, z)
      group.rotation.y = walker.reverse ? heading + Math.PI : heading
    }
  })

  return (
    <group>
      {walkers.map((walker, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
        >
          <PedestrianNPC shirtColor={walker.shirtColor} pantsColor={walker.pantsColor} skinTone={walker.skinTone} phase={walker.phase} />
        </group>
      ))}
    </group>
  )
}
