import { useFrame } from '@react-three/fiber'
import { useGameClock } from '../stores/useGameClock'
import { tickCustomers } from '../systems/customerSimulation'
import { tickStaff } from '../systems/staffSimulation'
import { tickSalePops } from '../systems/salePops'

// Guards against a real freeze (tab backgrounded, GC pause) causing a huge
// time jump, without silently slowing the game down on modest hardware —
// sustained frame times above this are rare even on weak/software-rendered
// GPUs, but a single stutter shouldn't warp the clock forward minutes.
const MAX_DELTA_SECONDS = 0.25

/** Drives the clock, staff, and customer simulations every frame,
 * independent of which camera mode (Build/Walk) is active. Staff ticks
 * before customers so a cashier who just came on duty is reflected in the
 * same frame's checkout dwell calculations. */
export function useGameLoop() {
  useFrame((_, delta) => {
    const clamped = Math.min(delta, MAX_DELTA_SECONDS)
    useGameClock.getState().advance(clamped)
    tickStaff(clamped)
    tickCustomers(clamped)
    tickSalePops(clamped)
  })
}
