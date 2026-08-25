// Pure — no React/Three imports. Shared closed-loop path sampling used by
// both CityTraffic (cars) and CityPedestrians (walkers) so "how far along
// this loop am I" -> "world x/z + heading" logic lives in exactly one place.
import type { Point } from '../data/cityLayout'

export interface RouteGeometry {
  points: Point[]
  segLengths: number[]
  total: number
}

export function buildRouteGeometry(route: Point[]): RouteGeometry {
  const segLengths: number[] = []
  let total = 0
  for (let i = 0; i < route.length; i++) {
    const a = route[i]
    const b = route[(i + 1) % route.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    segLengths.push(len)
    total += len
  }
  return { points: route, segLengths, total }
}

export interface RouteSample {
  x: number
  z: number
  heading: number
}

/** Resolve a distance-traveled-along-loop value to a world x/z + heading
 * (radians, matching Object3D.rotation.y convention). */
export function sampleRoute(geo: RouteGeometry, s: number): RouteSample {
  let remaining = ((s % geo.total) + geo.total) % geo.total
  for (let i = 0; i < geo.points.length; i++) {
    const len = geo.segLengths[i]
    if (remaining <= len || i === geo.points.length - 1) {
      const a = geo.points[i]
      const b = geo.points[(i + 1) % geo.points.length]
      const t = len > 0 ? remaining / len : 0
      const x = a[0] + (b[0] - a[0]) * t
      const z = a[1] + (b[1] - a[1]) * t
      const heading = -Math.atan2(b[1] - a[1], b[0] - a[0])
      return { x, z, heading }
    }
    remaining -= len
  }
  const [x, z] = geo.points[0]
  return { x, z, heading: 0 }
}
