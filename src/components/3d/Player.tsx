import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { LEVEL_HEIGHT, worldToCell } from '../../systems/grid'
import { useStoreLayout } from '../../stores/useStoreLayout'

const SPEED = 4.2
const EYE_HEIGHT = 1.6
const CAPSULE_HALF_HEIGHT = 0.45
const CAPSULE_RADIUS = 0.3
const BOB_FREQUENCY = 9
const BOB_AMPLITUDE = 0.045
const BOB_SWAY_AMPLITUDE = 0.02
/** Cooldown after using a staircase before it can trigger again, so
 * standing near the landing cell doesn't bounce the player up and down. */
const STAIRS_COOLDOWN_SECONDS = 1.2

interface KeyState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

const KEY_MAP: Record<string, keyof KeyState> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

interface PlayerProps {
  spawn?: [number, number, number]
}

export function Player({ spawn = [2, 1, 2] }: PlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null)
  const keysRef = useRef<KeyState>({ forward: false, backward: false, left: false, right: false })
  const bobPhase = useRef(0)
  const stairsCooldown = useRef(0)

  useEffect(() => {
    const handle = (down: boolean) => (event: KeyboardEvent) => {
      const key = KEY_MAP[event.code]
      if (key) keysRef.current[key] = down
    }
    const onKeyDown = handle(true)
    const onKeyUp = handle(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame(({ camera }, delta) => {
    const body = bodyRef.current
    if (!body) return

    const { forward, backward, left, right } = keysRef.current
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, euler.y, 0))
    const rightVec = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, euler.y, 0))

    const dir = new THREE.Vector3()
    if (forward) dir.add(forwardVec)
    if (backward) dir.sub(forwardVec)
    if (right) dir.add(rightVec)
    if (left) dir.sub(rightVec)

    const isMoving = dir.lengthSq() > 0
    const currentVel = body.linvel()
    if (isMoving) {
      dir.normalize().multiplyScalar(SPEED)
      body.setLinvel({ x: dir.x, y: currentVel.y, z: dir.z }, true)
    } else {
      body.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true)
    }

    // Footstep head-bob: only while grounded and moving, eases back to
    // center when idle so it never reads as constant camera jitter.
    const grounded = Math.abs(currentVel.y) < 0.5
    if (isMoving && grounded) {
      bobPhase.current += delta * BOB_FREQUENCY
    } else {
      bobPhase.current *= 0.85
    }
    const bobY = Math.abs(Math.sin(bobPhase.current)) * BOB_AMPLITUDE
    const bobX = Math.sin(bobPhase.current * 0.5) * BOB_SWAY_AMPLITUDE

    const pos = body.translation()

    if (stairsCooldown.current > 0) {
      stairsCooldown.current -= delta
    } else {
      const layout = useStoreLayout.getState()
      const level = layout.activeLevel
      const cell = worldToCell(pos.x, pos.z)
      if (level < layout.maxLevel && layout.hasStairsAt(cell, level) && layout.hasFloorAt(cell, level + 1)) {
        layout.setActiveLevel(level + 1)
        pos.y += LEVEL_HEIGHT
        body.setTranslation(pos, true)
        stairsCooldown.current = STAIRS_COOLDOWN_SECONDS
      } else if (level > 0 && layout.hasStairsAt(cell, level - 1)) {
        layout.setActiveLevel(level - 1)
        pos.y -= LEVEL_HEIGHT
        body.setTranslation(pos, true)
        stairsCooldown.current = STAIRS_COOLDOWN_SECONDS
      }
    }

    const eyeY = pos.y + EYE_HEIGHT - CAPSULE_HALF_HEIGHT - CAPSULE_RADIUS
    camera.position.set(pos.x + rightVec.x * bobX, eyeY + bobY, pos.z + rightVec.z * bobX)
  })

  return (
    <>
      <PointerLockControls />
      <RigidBody ref={bodyRef} position={spawn} colliders={false} mass={1} enabledRotations={[false, false, false]}>
        <CapsuleCollider args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]} />
      </RigidBody>
    </>
  )
}
