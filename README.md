# Retail Empire

A browser-based 3D retail simulation — build a store, stock it, run it, grow it into a chain. Inspired by the King of Retail games.

## Status: Phase 1 — Build Tool + One Empty Store

Grid-snapped placement of floors, walls, shelves, and a checkout counter; a Build Mode
(orbit camera) and Walk Mode (first-person, physics-based collision); undo/redo;
save/load to IndexedDB with JSON export/import. Geometry is intentionally placeholder
(boxes/planes) — the photoreal asset pass is a later phase.

The renderer targets `WebGPURenderer` (three.js) with automatic fallback to WebGL2,
both at the three.js level (`navigator.gpu` unavailable) and at the application level
(a runtime WebGPU error triggers a remount onto `forceWebGL`).

## Stack

React + TypeScript + Vite · Three.js / React Three Fiber / drei · @react-three/rapier
(physics/collision) · Zustand · Tailwind CSS · idb (IndexedDB)

## Getting started

```bash
npm install
npm run dev
```

## Controls

- **Build Mode**: left-click to place the selected tool (Floor/Wall/Shelf/Checkout),
  right-click to remove, `Rotate` to turn fixtures, orbit with the mouse.
- **Walk Mode**: click the canvas to lock the pointer, WASD to move, mouse to look,
  Esc to release the cursor.

## Project layout

```
src/
  scenes/       BuildModeScene, WalkModeScene
  components/3d Floor, Wall, Fixture, Ghost, GridFloor, Player, LayoutRenderer, LODTestProps
  components/ui HUD, BuildToolbar
  stores/       useGameMode, useBuildTool, useStoreLayout (Zustand)
  systems/      grid.ts — pure grid math, no React/Three imports
  data/         fixtureDefinitions.ts
  hooks/        useGridSnap, useSaveGame
```

See the build prompt for the full phased roadmap (retail loop, staff, marketing,
supply chain, corporate/franchising, competitors, events/seasons, photoreal pass).
