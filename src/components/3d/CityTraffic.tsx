import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { CAR_ROUTES } from '../../data/cityLayout'
import { buildRouteGeometry, sampleRoute } from '../../systems/cityRoutes'
import { CarMesh } from './CarMesh'

const CAR_COLORS = ['#c23b3b', '#3b6fc2', '#e8b93e', '#4a4f5a', '#e2e6ea', '#3aa66b', '#8a4fc2']
const CARS_PER_ROUTE = 3
const SPEED_MIN = 2.6
const SPEED_MAX = 4.4

interface CarInstance {
  routeIndex: number
  reverse: boolean
  speed: number
  offset: number
  color: string
}

/** Purely decorative traffic loop for the City Map scene: a small pool of
 * cars driving fixed closed-loop routes, positioned imperatively every
 * frame (no Zustand/React state) since nothing outside this layer needs to
 * know where a car is. */
export function CityTraffic() {
  const routeGeometries = useMemo(() => CAR_ROUTES.map(buildRouteGeometry), [])

  const cars = useMemo<CarInstance[]>(() => {
    const list: CarInstance[] = []
    routeGeometries.forEach((geo, routeIndex) => {
      for (let i = 0; i < CARS_PER_ROUTE; i++) {
        list.push({
          routeIndex,
          reverse: i % 2 === 1,
          speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
          offset: (geo.total / CARS_PER_ROUTE) * i + Math.random() * 4,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        })
      }
    })
    return list
  }, [routeGeometries])

  const groupRefs = useRef<(Group | null)[]>([])
  const distances = useRef<number[]>(cars.map((c) => c.offset))

  useFrame((_, delta) => {
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]
      const geo = routeGeometries[car.routeIndex]
      const dir = car.reverse ? -1 : 1
      distances.current[i] += car.speed * delta * dir
      const { x, z, heading } = sampleRoute(geo, distances.current[i])
      const group = groupRefs.current[i]
      if (!group) continue
      group.position.set(x, 0, z)
      group.rotation.y = car.reverse ? heading + Math.PI : heading
    }
  })

  return (
    <group>
      {cars.map((car, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
        >
          <CarMesh color={car.color} />
        </group>
      ))}
    </group>
  )
}
