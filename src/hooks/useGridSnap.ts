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

/** Tracks the current pointer's snapped grid target for the active build tool. */
export function useGridSnap(
  tool: 'floor' | 'wall' | 'shelf' | 'checkout' | 'stairs',
  isValid: (target: NonNullable<SnapTarget>) => boolean,
) {
  const [target, setTarget] = useState<SnapTarget>(null)

  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      const { x, z } = event.point
      let next: SnapTarget = null

      if (tool === 'wall') {
        const { cell, orientation } = worldToNearestEdge(x, z)
        if (isEdgeWithinBounds(cell, orientation)) {
          next = { kind: 'wall', cell, orientation, valid: false }
          next.valid = isValid(next)
        }
      } else if (tool === 'floor') {
        const cell = worldToCell(x, z)
        if (isWithinBounds(cell)) {
          next = { kind: 'floor', cell, valid: false }
          next.valid = isValid(next)
        }
      } else if (tool === 'shelf' || tool === 'checkout' || tool === 'stairs') {
        const cell = worldToCell(x, z)
        if (isWithinBounds(cell)) {
          next = { kind: 'fixture', cell, valid: false }
          next.valid = isValid(next)
        }
      }

      setTarget(next)
    },
    [tool, isValid],
  )

  const onPointerLeave = useCallback(() => setTarget(null), [])

  return { target, onPointerMove, onPointerLeave }
}
