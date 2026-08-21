import { useRef, useState, type PointerEvent } from 'react'
import { setJoystick, releaseJoystick, addLookDelta } from '../../systems/touchInput'

const JOYSTICK_RADIUS = 46

/** On-screen movement joystick (bottom-left) and a look-drag zone (right
 * half of the screen) for Walk mode on touch devices — there's no keyboard
 * for WASD and no mouse for pointer-lock look, so touch needs its own input
 * scheme entirely. Rendered before the rest of the HUD in the tree so
 * later-painted buttons (stat bar, panel dock, End Day, etc.) sit above the
 * look-drag zone and still receive their own taps. */
export function TouchControls() {
  const baseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const joystickPointerId = useRef<number | null>(null)
  const lookPointerId = useRef<number | null>(null)
  const lastLookPos = useRef({ x: 0, y: 0 })

  const updateJoystick = (e: PointerEvent) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = e.clientX - cx
    let dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > JOYSTICK_RADIUS) {
      dx = (dx / dist) * JOYSTICK_RADIUS
      dy = (dy / dist) * JOYSTICK_RADIUS
    }
    setKnob({ x: dx, y: dy })
    setJoystick(dx / JOYSTICK_RADIUS, dy / JOYSTICK_RADIUS)
  }

  const handleJoystickDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    joystickPointerId.current = e.pointerId
    updateJoystick(e)
  }
  const handleJoystickMove = (e: PointerEvent<HTMLDivElement>) => {
    if (joystickPointerId.current !== e.pointerId) return
    updateJoystick(e)
  }
  const handleJoystickUp = (e: PointerEvent<HTMLDivElement>) => {
    if (joystickPointerId.current !== e.pointerId) return
    joystickPointerId.current = null
    setKnob({ x: 0, y: 0 })
    releaseJoystick()
  }

  const handleLookDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    lookPointerId.current = e.pointerId
    lastLookPos.current = { x: e.clientX, y: e.clientY }
  }
  const handleLookMove = (e: PointerEvent<HTMLDivElement>) => {
    if (lookPointerId.current !== e.pointerId) return
    const dx = e.clientX - lastLookPos.current.x
    const dy = e.clientY - lastLookPos.current.y
    lastLookPos.current = { x: e.clientX, y: e.clientY }
    addLookDelta(dx, dy)
  }
  const handleLookUp = (e: PointerEvent<HTMLDivElement>) => {
    if (lookPointerId.current !== e.pointerId) return
    lookPointerId.current = null
  }

  return (
    <>
      <div
        className="pointer-events-auto absolute inset-y-0 right-0 w-1/2"
        style={{ touchAction: 'none' }}
        onPointerDown={handleLookDown}
        onPointerMove={handleLookMove}
        onPointerUp={handleLookUp}
        onPointerCancel={handleLookUp}
      />

      <div
        ref={baseRef}
        data-testid="touch-joystick-base"
        className="pointer-events-auto absolute bottom-24 left-8 w-28 h-28 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
        style={{ touchAction: 'none' }}
        onPointerDown={handleJoystickDown}
        onPointerMove={handleJoystickMove}
        onPointerUp={handleJoystickUp}
        onPointerCancel={handleJoystickUp}
      >
        <div
          className="absolute w-12 h-12 rounded-full bg-white/40 border border-white/60"
          style={{ left: `calc(50% + ${knob.x}px - 24px)`, top: `calc(50% + ${knob.y}px - 24px)` }}
        />
      </div>
    </>
  )
}
