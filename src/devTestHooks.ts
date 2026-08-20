// Dev-only — imported behind an import.meta.env.DEV check, never bundled
// into production. Exposes stores on window for Playwright-driven E2E
// smoke tests, where computing exact screen-to-grid pixel coordinates
// against the isometric build camera isn't worth the fragility.
import { useStoreLayout } from './stores/useStoreLayout'
import { useInventory } from './stores/useInventory'
import { useFinance } from './stores/useFinance'
import { useGameClock } from './stores/useGameClock'
import { useCustomers } from './stores/useCustomers'
import { useStaff } from './stores/useStaff'
import { useStoreAtmosphere } from './stores/useStoreAtmosphere'
import { getLiveCustomers } from './systems/customerSimulation'
import { getLiveStaff } from './systems/staffSimulation'

declare global {
  interface Window {
    __retailEmpireDebug?: {
      useStoreLayout: typeof useStoreLayout
      useInventory: typeof useInventory
      useFinance: typeof useFinance
      useGameClock: typeof useGameClock
      useCustomers: typeof useCustomers
      useStaff: typeof useStaff
      useStoreAtmosphere: typeof useStoreAtmosphere
      getLiveCustomers: typeof getLiveCustomers
      getLiveStaff: typeof getLiveStaff
    }
  }
}

window.__retailEmpireDebug = {
  useStoreLayout,
  useInventory,
  useFinance,
  useGameClock,
  useCustomers,
  useStaff,
  useStoreAtmosphere,
  getLiveCustomers,
  getLiveStaff,
}
