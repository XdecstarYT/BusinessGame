# Retail Empire

A browser-based 3D retail simulation — build a store, stock it, run it, grow it into a chain. Inspired by the King of Retail games.

## Status: Phase 3 — Staff & Atmosphere

**Phase 1 — build tool.** Grid-snapped placement of floors, walls, shelves, and a
checkout counter; a Build Mode (orbit camera) and Walk Mode (first-person,
physics-based collision); undo/redo; save/load to IndexedDB with JSON export/import.
Geometry is intentionally placeholder (boxes/planes) — the photoreal asset pass is a
later phase.

**Phase 2 — retail loop.** An 8-product catalog; a stockroom with a capacity cap you
order stock into; per-shelf product assignment and restocking; a grid A* pathfinder;
customers that spawn, shop a shelf-by-shelf cart, queue and pay at checkout, and leave;
a day/night-agnostic clock with daily rent and a rolling P&L history chart. Products are
stocked as visible colored blocks on shelves, scaled by fill level.

**Phase 3 — staff & atmosphere.** Hire Stockers, Cashiers, and Janitors (Manager and
Security are deliberately deferred — their real mechanics don't exist until Phase 7's
auto-run and Phase 4's theft system, and a hire button with zero effect would be a
half-finished feature); each has a shift window, a wage you can raise or cut, and morale
that drifts toward a target set by wage-vs-market-rate. On duty, Stockers auto-restock
low shelves, Cashiers assigned to a checkout speed up customer checkout, and Janitors
raise the store's cleanliness score. Cleanliness decays over time and with foot traffic,
and — together with a lighting-mood setting (Bright/Neutral/Warm/Dim) — nudges how often
customers show up. Payroll is deducted at day-end alongside rent.

The renderer targets `WebGPURenderer` (three.js) with automatic fallback to WebGL2,
both at the three.js level (`navigator.gpu` unavailable) and at the application level
(a runtime WebGPU error triggers a remount onto `forceWebGL`).

## Stack

React + TypeScript + Vite · Three.js / React Three Fiber / drei · @react-three/rapier
(physics/collision) · Zustand · Tailwind CSS · Recharts · idb (IndexedDB)

## Getting started

```bash
npm install
npm run dev
```

## Controls

- **Build Mode**: left-click to place the selected tool (Floor/Wall/Shelf/Checkout),
  right-click to remove, `Rotate` to turn fixtures, orbit with the mouse. Open
  **📦 Inventory** to order stock and assign/restock shelves, **👥 Staff** to hire and
  manage staff and store atmosphere, **💰 Finance** for today's P&L and profit history.
- **Walk Mode**: click the canvas to lock the pointer, WASD to move, mouse to look,
  Esc to release the cursor.

## Project layout

```
src/
  scenes/       BuildModeScene, WalkModeScene
  components/3d Floor, Wall, Fixture, Ghost, GridFloor, Player, LayoutRenderer,
                CustomerNPC, CustomersLayer, StaffNPC, StaffLayer, StoreLighting,
                SimulationDriver, LODTestProps
  components/ui HUD, BuildToolbar, InventoryPanel, StaffPanel, FinancePanel
  stores/       useGameMode, useBuildTool, useStoreLayout, useInventory, useFinance,
                useGameClock, useCustomers, useStaff, useStoreAtmosphere (Zustand)
  systems/      grid.ts, pathfinding.ts (grid A*), movement.ts (shared path-stepping,
                used by both NPC simulations), customerAI.ts / customerSimulation.ts,
                staffAI.ts (pure: on-duty windows, morale target/drift, checkout speed)
                / staffSimulation.ts (impure per-frame orchestrator — deliberately
                outside Zustand so movement doesn't re-render React every frame),
                financeTick.ts
  data/         fixtureDefinitions.ts, products.ts, staffDefinitions.ts
  hooks/        useGridSnap, useSaveGame, useGameLoop
  devTestHooks.ts  dev-only (import.meta.env.DEV-gated, dead-code-eliminated in
                   production) — exposes stores on window for E2E test scripts
```

See the build prompt for the full phased roadmap (marketing/theft, expansion, supply
chain, corporate/franchising, competitors, events/seasons, photoreal pass).
