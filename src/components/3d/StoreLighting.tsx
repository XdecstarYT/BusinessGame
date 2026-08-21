import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LIGHTING_MOODS, useStoreAtmosphere } from '../../stores/useStoreAtmosphere'
import { currentGameHour } from '../../stores/useGameClock'
import { skyStateForHour } from '../../systems/dayNightCycle'

interface StoreLightingProps {
  directionalPosition: [number, number, number]
}

/** How much the time-of-day tint pulls the directional light's color away
 * from the player's chosen mood — mood still dominates, dawn/dusk just
 * warms or cools it. */
const TIME_OF_DAY_BLEND = 0.4

const moodColor = new THREE.Color()
const timeColor = new THREE.Color()

/** Ambient + directional lighting driven by the player's chosen mood
 * (Bright/Neutral/Warm/Dim) — shared between Build and Walk mode so
 * changing it in one place is felt everywhere. The directional light also
 * drifts with the game clock's time of day (see dayNightCycle.ts), since
 * it stands in for sunlight through the windows. */
export function StoreLighting({ directionalPosition }: StoreLightingProps) {
  const mood = useStoreAtmosphere((s) => s.lightingMood)
  const def = LIGHTING_MOODS[mood]
  const lightRef = useRef<THREE.DirectionalLight>(null)

  useFrame(() => {
    const light = lightRef.current
    if (!light) return
    const { lightColor, intensityMultiplier } = skyStateForHour(currentGameHour())
    moodColor.set(def.color)
    timeColor.set(lightColor)
    moodColor.lerp(timeColor, TIME_OF_DAY_BLEND)
    light.color.copy(moodColor)
    light.intensity = def.intensity * intensityMultiplier
  })

  return (
    <>
      <ambientLight intensity={def.ambient} color={def.color} />
      <directionalLight ref={lightRef} position={directionalPosition} intensity={def.intensity} color={def.color} castShadow shadow-mapSize={[2048, 2048]} />
    </>
  )
}
