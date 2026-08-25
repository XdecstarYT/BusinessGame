import { useMemo } from 'react'
import { ROAD_SEGMENTS, ROAD_WIDTH, SIDEWALK_WIDTH, type RoadSegment } from '../../data/cityLayout'

const ASPHALT_COLOR = '#2b2f38'
const SIDEWALK_COLOR = '#8b8f98'
const LINE_COLOR = '#e8c95a'
const DASH_LENGTH = 1.4
const DASH_GAP = 1.6

function angleForDirection(dx: number, dz: number): number {
  return -Math.atan2(dz, dx)
}

interface Derived {
  cx: number
  cz: number
  length: number
  angle: number
  dashes: number[]
}

function deriveSegment(seg: RoadSegment): Derived {
  const dx = seg.to[0] - seg.from[0]
  const dz = seg.to[1] - seg.from[1]
  const length = Math.hypot(dx, dz)
  const angle = angleForDirection(dx, dz)
  const cx = (seg.from[0] + seg.to[0]) / 2
  const cz = (seg.from[1] + seg.to[1]) / 2

  const stride = DASH_LENGTH + DASH_GAP
  const count = Math.max(0, Math.floor((length - DASH_LENGTH) / stride))
  const dashes: number[] = []
  const start = -length / 2 + DASH_LENGTH / 2 + 1
  for (let i = 0; i < count; i++) dashes.push(start + i * stride)

  return { cx, cz, length, angle, dashes }
}

/** Static road-grid geometry: asphalt strips with center-line dashes,
 * flanking sidewalks, and small paved squares at every junction so
 * intersecting strips don't leave visible gaps. Purely decorative — no
 * interaction, no per-frame updates. */
export function CityRoads() {
  const derived = useMemo(() => ROAD_SEGMENTS.map(deriveSegment), [])

  const junctions = useMemo(() => {
    const seen = new Map<string, [number, number]>()
    for (const seg of ROAD_SEGMENTS) {
      for (const p of [seg.from, seg.to]) {
        const key = `${p[0]},${p[1]}`
        if (!seen.has(key)) seen.set(key, p)
      }
    }
    return Array.from(seen.values())
  }, [])

  return (
    <group>
      {derived.map((d, i) => (
        <group key={i} position={[d.cx, 0, d.cz]} rotation={[0, d.angle, 0]}>
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[d.length, 0.06, ROAD_WIDTH]} />
            <meshStandardMaterial color={ASPHALT_COLOR} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.015, ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2]} receiveShadow>
            <boxGeometry args={[d.length, 0.09, SIDEWALK_WIDTH]} />
            <meshStandardMaterial color={SIDEWALK_COLOR} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.015, -(ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2)]} receiveShadow>
            <boxGeometry args={[d.length, 0.09, SIDEWALK_WIDTH]} />
            <meshStandardMaterial color={SIDEWALK_COLOR} roughness={0.9} />
          </mesh>
          {d.dashes.map((offset, j) => (
            <mesh key={j} position={[offset, 0.061, 0]}>
              <boxGeometry args={[DASH_LENGTH, 0.01, 0.18]} />
              <meshStandardMaterial color={LINE_COLOR} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {junctions.map((p, i) => (
        <mesh key={i} position={[p[0], 0.03, p[1]]} receiveShadow>
          <boxGeometry args={[ROAD_WIDTH, 0.06, ROAD_WIDTH]} />
          <meshStandardMaterial color={ASPHALT_COLOR} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
