// Mutable, module-level touch input state for mobile Walk-mode controls —
// same "outside React" pattern as customerSimulation/staffSimulation.
// Written by TouchControls.tsx's pointer handlers (a DOM overlay outside
// the canvas), read every frame by Player.tsx.

interface JoystickState {
  x: number
  y: number
}

const joystick: JoystickState = { x: 0, y: 0 }
let lookDeltaX = 0
let lookDeltaY = 0

/** x/y each in -1..1 — set continuously while the joystick knob is held. */
export function setJoystick(x: number, y: number): void {
  joystick.x = x
  joystick.y = y
}

export function releaseJoystick(): void {
  joystick.x = 0
  joystick.y = 0
}

export function getJoystick(): Readonly<JoystickState> {
  return joystick
}

/** Accumulates a look-drag delta (raw pixels) between frames. */
export function addLookDelta(dx: number, dy: number): void {
  lookDeltaX += dx
  lookDeltaY += dy
}

/** Called once per frame by Player.tsx — returns the accumulated look delta
 * since the last call and resets it. */
export function consumeLookDelta(): { dx: number; dy: number } {
  const dx = lookDeltaX
  const dy = lookDeltaY
  lookDeltaX = 0
  lookDeltaY = 0
  return { dx, dy }
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
