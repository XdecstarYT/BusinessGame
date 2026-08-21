// Pure — no React/Three imports, unit-testable in isolation.
//
// Store hours run 8am-10pm (see useGameClock's dayProgressToHour) — the
// simulation has no concept of midnight/pre-dawn hours to cycle through, so
// this is a dawn-to-dusk lighting arc across those hours rather than a full
// 24-hour day/night cycle. Redefining the hour model to add real nighttime
// would ripple into staff shift windows and customer spawn logic that are
// already keyed off it.

export interface SkyState {
  skyTop: string
  skyHorizon: string
  lightColor: string
  /** Multiplies StoreLighting's mood-based intensity — dimmer at the edges
   * of the day, full brightness through the middle. */
  intensityMultiplier: number
}

interface Keyframe extends SkyState {
  hour: number
}

const KEYFRAMES: Keyframe[] = [
  { hour: 8, skyTop: '#7ea3c9', skyHorizon: '#f2c6a0', lightColor: '#ffd9a8', intensityMultiplier: 0.75 },
  { hour: 11, skyTop: '#4a90d9', skyHorizon: '#dce9f5', lightColor: '#ffffff', intensityMultiplier: 1.0 },
  { hour: 16, skyTop: '#4a90d9', skyHorizon: '#dce9f5', lightColor: '#fff6e0', intensityMultiplier: 1.0 },
  { hour: 19, skyTop: '#5b6ea8', skyHorizon: '#e8916a', lightColor: '#ff9d5c', intensityMultiplier: 0.85 },
  { hour: 22, skyTop: '#2c3357', skyHorizon: '#6a4a6e', lightColor: '#8a7ab0', intensityMultiplier: 0.55 },
]

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

/** Interpolates the sky/lighting keyframes for a given store-hours hour (8-22). */
export function skyStateForHour(hour: number): SkyState {
  const clamped = Math.max(KEYFRAMES[0].hour, Math.min(KEYFRAMES[KEYFRAMES.length - 1].hour, hour))

  let lower = KEYFRAMES[0]
  let upper = KEYFRAMES[KEYFRAMES.length - 1]
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clamped >= KEYFRAMES[i].hour && clamped <= KEYFRAMES[i + 1].hour) {
      lower = KEYFRAMES[i]
      upper = KEYFRAMES[i + 1]
      break
    }
  }

  const span = upper.hour - lower.hour
  const t = span === 0 ? 0 : (clamped - lower.hour) / span

  return {
    skyTop: lerpHex(lower.skyTop, upper.skyTop, t),
    skyHorizon: lerpHex(lower.skyHorizon, upper.skyHorizon, t),
    lightColor: lerpHex(lower.lightColor, upper.lightColor, t),
    intensityMultiplier: lower.intensityMultiplier + (upper.intensityMultiplier - lower.intensityMultiplier) * t,
  }
}
