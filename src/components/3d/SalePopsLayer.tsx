import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { getSalePops, type SalePop } from '../../systems/salePops'

const POLL_INTERVAL = 0.08

/** Floating "+$X.XX" feedback at checkout. Sale pops are infrequent (tied to
 * checkout completions, not per-frame customer movement), so unlike the
 * customer/staff layers this is fine to drive through light React state
 * instead of pure ref mutation — polled a few times a second rather than
 * every frame since exact fade timing doesn't need to be frame-perfect. */
export function SalePopsLayer() {
  const [pops, setPops] = useState<readonly SalePop[]>([])
  const accumulator = useRef(0)

  useFrame((_, delta) => {
    accumulator.current += delta
    if (accumulator.current < POLL_INTERVAL) return
    accumulator.current = 0
    const live = getSalePops()
    if (live.length > 0 || pops.length > 0) setPops(live.map((p) => ({ ...p, position: p.position.clone() })))
  })

  return (
    <>
      {pops.map((pop) => (
        <Html key={pop.id} position={[pop.position.x, pop.position.y, pop.position.z]} center>
          <div
            style={{
              opacity: Math.min(1, pop.life / 0.5),
              color: '#34d399',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.85)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            +${pop.amount.toFixed(2)}
          </div>
        </Html>
      ))}
    </>
  )
}
