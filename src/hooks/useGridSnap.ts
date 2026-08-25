import { useCallback, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import {
  isEdgeWithinBounds,
  isWithinBounds,
  worldToCell,
  worldToNearestEdge,
  type Cell,
  type WallOrientation,
} from '../systems/grid'

export interface FloorTarget {
  kind: 'floor'
  cell: Cell
  valid: boolean
}

export interface WallTarget {
  kind: 'wall'
  cell: Cell
  orientation: WallOrientation
  valid: boolean
}

export interface FixtureTarget {
  kind: 'fixture'
  cell: Cell
  valid: boolean
}

export type SnapTarget = FloorTarget | WallTarget | FixtureTarget | null

/** Tracks the current pointer's snapped grid target for the active build
 * tool. Also exposes `computeTarget` as a standalone function — a mouse
 * continuously fires pointermove while hovering, so `target` state is
 * already fresh by the time a click lands, but touch has no hover: the
 * very first event for a tap is pointerdown itself. Placement must compute
 * the target directly from that event rather than trust possibly-stale
 * `target` state, or a first tap silently does nothing. */
export function useGridSnap(
  tool: 'floor' | 'wall' | 'shelf' | 'checkout' | 'stairs' | 'decoration',
  isValid: (target: NonNullable<SnapTarget>) => boolean,
) {
  const [target, setTarget] = useState<SnapTarget>(null)

  const computeTarget = useCallback(
    (point: { x: number; z: number }): SnapTarget => {
      const { x, z } = point

      if (tool === 'wall') {
        const { cell, orientation } = worldToNearestEdge(x, z)
        if (!isEdgeWithinBounds(cell, orientation)) return null
        const next: WallTarget = { kind: 'wall', cell, orientation, valid: false }
        next.valid = isValid(next)
        return next
      }

      const cell = worldToCell(x, z)
      if (!isWithinBounds(cell)) return null

      if (tool === 'floor') {
        const next: FloorTarget = { kind: 'floor', cell, valid: false }
        next.valid = isValid(next)
        return next
      }

      const next: FixtureTarget = { kind: 'fixture', cell, valid: false }
      next.valid = isValid(next)
      return next
    },
    [tool, isValid],
  )

  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      setTarget(computeTarget(event.point))
    },
    [computeTarget],
  )

  const onPointerLeave = useCallback(() => setTarget(null), [])

  return { target, computeTarget, onPointerMove, onPointerLeave }
}
