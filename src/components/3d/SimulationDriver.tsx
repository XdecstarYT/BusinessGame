import { useGameLoop } from '../../hooks/useGameLoop'

/** Mounted at the App level only while the game is in Play phase, so the
 * economy and customer AI run exactly while the store is open — Build phase
 * mounts nothing here and stays fully frozen. */
export function SimulationDriver() {
  useGameLoop()
  return null
}
