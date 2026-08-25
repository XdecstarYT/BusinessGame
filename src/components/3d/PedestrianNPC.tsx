import { HumanoidBody } from './HumanoidBody'

interface PedestrianNPCProps {
  shirtColor: string
  pantsColor: string
  skinTone: string
  phase: number
}

/** City-sidewalk walker: the shared HumanoidBody rig with its walk-cycle
 * animation turned on, recolored per-instance for crowd variety. */
export function PedestrianNPC({ shirtColor, pantsColor, skinTone, phase }: PedestrianNPCProps) {
  return <HumanoidBody shirtColor={shirtColor} pantsColor={pantsColor} skinTone={skinTone} walking phase={phase} />
}
