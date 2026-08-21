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
import { useReputation } from './stores/useReputation'
import { useMarketing } from './stores/useMarketing'
import { useCityMap } from './stores/useCityMap'
import { useSupplyChain } from './stores/useSupplyChain'
import { useCorporateFinance } from './stores/useCorporateFinance'
import { useCorporateHQ } from './stores/useCorporateHQ'
import { useCompetitors } from './stores/useCompetitors'
import { useEvents } from './stores/useEvents'
import { useAchievements } from './stores/useAchievements'
import { useAnalytics } from './stores/useAnalytics'
import { useGameMode } from './stores/useGameMode'
import { getLiveCustomers, getHeatGrid, resetLiveCustomers } from './systems/customerSimulation'
import { getLiveStaff } from './systems/staffSimulation'
import { PRODUCTS } from './data/products'
import { STARTER_BLUEPRINTS } from './data/starterBlueprints'

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
      useReputation: typeof useReputation
      useMarketing: typeof useMarketing
      useCityMap: typeof useCityMap
      useSupplyChain: typeof useSupplyChain
      useCorporateFinance: typeof useCorporateFinance
      useCorporateHQ: typeof useCorporateHQ
      useCompetitors: typeof useCompetitors
      useEvents: typeof useEvents
      useAchievements: typeof useAchievements
      useAnalytics: typeof useAnalytics
      useGameMode: typeof useGameMode
      getLiveCustomers: typeof getLiveCustomers
      getLiveStaff: typeof getLiveStaff
      getHeatGrid: typeof getHeatGrid
      resetLiveCustomers: typeof resetLiveCustomers
      PRODUCTS: typeof PRODUCTS
      STARTER_BLUEPRINTS: typeof STARTER_BLUEPRINTS
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
  useReputation,
  useMarketing,
  useCityMap,
  useSupplyChain,
  useCorporateFinance,
  useCorporateHQ,
  useCompetitors,
  useEvents,
  useAchievements,
  useAnalytics,
  useGameMode,
  getLiveCustomers,
  getLiveStaff,
  getHeatGrid,
  resetLiveCustomers,
  PRODUCTS,
  STARTER_BLUEPRINTS,
}
