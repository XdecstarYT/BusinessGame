import { useGameLoop } from '../../hooks/useGameLoop'

/** Mounted once at the App level (outside the Build/Walk mode switch) so the
 * economy and customer AI keep running no matter which camera is active. */
export function SimulationDriver() {
  useGameLoop()
  return null
}
