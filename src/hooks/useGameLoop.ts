import { useFrame } from '@react-three/fiber'
import { useGameClock } from '../stores/useGameClock'
import { useGameMode } from '../stores/useGameMode'
import { tickCustomers, resetLiveCustomers } from '../systems/customerSimulation'
import { tickStaff } from '../systems/staffSimulation'
import { tickSalePops } from '../systems/salePops'

// Guards against a real freeze (tab backgrounded, GC pause) causing a huge
// time jump, without silently slowing the game down on modest hardware —
// sustained frame times above this are rare even on weak/software-rendered
// GPUs, but a single stutter shouldn't warp the clock forward minutes.
const MAX_DELTA_SECONDS = 0.25

/** Drives the clock, staff, and customer simulations every frame. Only
 * mounted while the game is in Play phase (see SimulationDriver) — Build
 * phase is untimed, so nothing here runs then. Staff ticks before customers
 * so a cashier who just came on duty is reflected in the same frame's
 * checkout dwell calculations. */
export function useGameLoop() {
  useFrame((_, delta) => {
    const clamped = Math.min(delta, MAX_DELTA_SECONDS)
    const dayBefore = useGameClock.getState().day
    useGameClock.getState().advance(clamped)

    // Day rolled over — close the store for the night and hand control back
    // to Build phase instead of ticking one more frame of stale customers.
    if (useGameClock.getState().day !== dayBefore) {
      resetLiveCustomers()
      useGameMode.getState().endDay()
      return
    }

    tickStaff(clamped)
    tickCustomers(clamped)
    tickSalePops(clamped)
  })
}
