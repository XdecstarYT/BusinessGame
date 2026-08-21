import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getLiveCustomers } from '../../systems/customerSimulation'
import { getLiveStaff } from '../../systems/staffSimulation'
import { GRID_WIDTH, GRID_DEPTH } from '../../systems/grid'

const CUT_INTERVAL_MIN = 5
const CUT_INTERVAL_RANGE = 4
const TRANSITION_SECONDS = 1.5
const LOOK_HEIGHT = 1.3

interface RigState {
  camFrom: THREE.Vector3
  camTo: THREE.Vector3
  lookFrom: THREE.Vector3
  lookTo: THREE.Vector3
  t: number
  cutTimer: number
  initialized: boolean
}

function pickFocusPosition(): THREE.Vector3 {
  const pool = [...getLiveCustomers(), ...getLiveStaff().filter((npc) => npc.onDuty)]
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)].position
  }
  return new THREE.Vector3(GRID_WIDTH / 2, 1, GRID_DEPTH / 2)
}

/** A camera "director" for spectating Play phase: cuts every few seconds to
 * a fresh orbiting shot of a random live customer or on-duty staff member,
 * smoothly easing between shots rather than snapping. Falls back to a
 * establishing shot of the store's center when nobody is around yet. */
export function CinematicCameraRig() {
  const state = useRef<RigState>({
    camFrom: new THREE.Vector3(),
    camTo: new THREE.Vector3(),
    lookFrom: new THREE.Vector3(),
    lookTo: new THREE.Vector3(),
    t: 1,
    cutTimer: 0,
    initialized: false,
  })

  const pickShot = () => {
    const s = state.current
    const focus = pickFocusPosition()
    const angle = Math.random() * Math.PI * 2
    const dist = 3.5 + Math.random() * 3
    const height = 2 + Math.random() * 1.8

    s.camFrom.copy(s.camTo)
    s.lookFrom.copy(s.lookTo)
    s.camTo.set(focus.x + Math.cos(angle) * dist, height, focus.z + Math.sin(angle) * dist)
    s.lookTo.set(focus.x, LOOK_HEIGHT, focus.z)
    s.t = 0
    s.cutTimer = CUT_INTERVAL_MIN + Math.random() * CUT_INTERVAL_RANGE
  }

  useFrame(({ camera }, delta) => {
    const s = state.current
    if (!s.initialized) {
      pickShot()
      s.camFrom.copy(s.camTo)
      s.lookFrom.copy(s.lookTo)
      s.t = 1
      s.initialized = true
    }

    s.cutTimer -= delta
    if (s.cutTimer <= 0) pickShot()

    s.t = Math.min(1, s.t + delta / TRANSITION_SECONDS)
    const eased = 1 - Math.pow(1 - s.t, 3)
    camera.position.lerpVectors(s.camFrom, s.camTo, eased)
    const lookPoint = new THREE.Vector3().lerpVectors(s.lookFrom, s.lookTo, eased)
    camera.lookAt(lookPoint)
  })

  return null
}
