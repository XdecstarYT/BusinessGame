import { LIGHTING_MOODS, useStoreAtmosphere } from '../../stores/useStoreAtmosphere'

interface StoreLightingProps {
  directionalPosition: [number, number, number]
}

/** Ambient + directional lighting driven by the player's chosen mood
 * (Bright/Neutral/Warm/Dim) — shared between Build and Walk mode so
 * changing it in one place is felt everywhere. */
export function StoreLighting({ directionalPosition }: StoreLightingProps) {
  const mood = useStoreAtmosphere((s) => s.lightingMood)
  const def = LIGHTING_MOODS[mood]

  return (
    <>
      <ambientLight intensity={def.ambient} color={def.color} />
      <directionalLight
        position={directionalPosition}
        intensity={def.intensity}
        color={def.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </>
  )
}
