import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { getLiveCustomers } from '../../systems/customerSimulation'
import { getLiveStaff } from '../../systems/staffSimulation'

const POLL_INTERVAL = 0.15
const BUBBLE_LIFETIME = 2.6
const MAX_ACTIVE = 3
/** Rolled once per poll per eligible NPC without an active bubble already —
 * keeps bubbles sporadic and readable instead of everyone talking at once. */
const SPAWN_CHANCE = 0.05

const CUSTOMER_LINES: Record<string, string[]> = {
  shopping: ['Now where was that...', 'Let me check this price.', 'Ooh, nice selection!', 'Hmm, not quite.'],
  queueing: ['This line is taking a while...', 'Almost my turn!'],
  checkingOut: ['Thanks!', 'That was quick.'],
  leaving: ['Great store!', "I'll be back.", 'Could be better, honestly.'],
}

const STAFF_LINES: Record<string, string[]> = {
  stocker: ['Restocking now!', 'Shelves look good.'],
  cashier: ['Next, please!', 'Have a great day!'],
  janitor: ['Just tidying up.', 'Almost done here.'],
  security: ['Keeping an eye out.', 'All clear.'],
  manager: ['Numbers look solid.'],
}

function randomLine(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

interface RenderedBubble {
  id: string
  text: string
  position: THREE.Vector3
}

interface TrackedBubble {
  text: string
  life: number
  kind: 'customer' | 'staff'
}

/** Occasional floating speech-bubble flavor text over customers/staff during
 * Play — purely cosmetic texture, not simulation-critical, so it lives as
 * local component state polled at a modest rate rather than a Zustand store
 * or a per-frame system (same reasoning as SalePopsLayer). */
export function DialogueBubblesLayer() {
  const tracked = useRef<Map<string, TrackedBubble>>(new Map())
  const [rendered, setRendered] = useState<RenderedBubble[]>([])
  const accumulator = useRef(0)

  useFrame((_, delta) => {
    accumulator.current += delta
    if (accumulator.current < POLL_INTERVAL) return
    const dt = accumulator.current
    accumulator.current = 0

    const customers = getLiveCustomers()
    const staff = getLiveStaff().filter((s) => s.onDuty)
    const liveIds = new Set<string>([...customers.map((c) => c.id), ...staff.map((s) => s.id)])

    const map = tracked.current
    for (const [id, bubble] of map) {
      bubble.life -= dt
      if (bubble.life <= 0 || !liveIds.has(id)) map.delete(id)
    }

    if (map.size < MAX_ACTIVE) {
      const candidates: { id: string; kind: 'customer' | 'staff'; pool: string[] }[] = [
        ...customers
          .filter((c) => !map.has(c.id) && CUSTOMER_LINES[c.phase]?.length)
          .map((c) => ({ id: c.id, kind: 'customer' as const, pool: CUSTOMER_LINES[c.phase] })),
        ...staff
          .filter((s) => !map.has(s.id) && STAFF_LINES[s.role]?.length)
          .map((s) => ({ id: s.id, kind: 'staff' as const, pool: STAFF_LINES[s.role] })),
      ]

      for (const candidate of candidates) {
        if (map.size >= MAX_ACTIVE) break
        if (Math.random() < SPAWN_CHANCE) {
          map.set(candidate.id, { text: randomLine(candidate.pool), life: BUBBLE_LIFETIME, kind: candidate.kind })
        }
      }
    }

    const next: RenderedBubble[] = []
    for (const [id, bubble] of map) {
      const entity = bubble.kind === 'customer' ? customers.find((c) => c.id === id) : staff.find((s) => s.id === id)
      if (!entity) continue
      next.push({ id, text: bubble.text, position: entity.position.clone() })
    }
    setRendered(next)
  })

  return (
    <>
      {rendered.map((bubble) => (
        <Html key={bubble.id} position={[bubble.position.x, bubble.position.y + 1.85, bubble.position.z]} center>
          <div
            style={{
              background: 'rgba(20,22,28,0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '4px 9px',
              fontSize: 11,
              fontFamily: "'Manrope', system-ui, sans-serif",
              color: 'rgba(255,255,255,0.92)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            {bubble.text}
          </div>
        </Html>
      ))}
    </>
  )
}
