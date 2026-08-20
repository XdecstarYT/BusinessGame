import { useFrame } from '@react-three/fiber'
import { useGameClock } from '../stores/useGameClock'
import { tickCustomers } from '../systems/customerSimulation'

const MAX_DELTA_SECONDS = 0.1

/** Drives the clock and customer simulation every frame, independent of
 * which camera mode (Build/Walk) is active. */
export function useGameLoop() {
  useFrame((_, delta) => {
    const clamped = Math.min(delta, MAX_DELTA_SECONDS)
    useGameClock.getState().advance(clamped)
    tickCustomers(clamped)
  })
}
