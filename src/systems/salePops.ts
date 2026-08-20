// Impure, tiny — floating "+$X.XX" feedback popups at checkout. Same
// reasoning as customer/staff simulation: transient per-frame visual state
// doesn't belong in Zustand.
import * as THREE from 'three'

export interface SalePop {
  id: number
  position: THREE.Vector3
  amount: number
  life: number
}

const POP_LIFETIME = 1.4
const RISE_SPEED = 0.35

let pops: SalePop[] = []
let nextId = 1

export function spawnSalePop(position: THREE.Vector3, amount: number): void {
  pops.push({ id: nextId++, position: position.clone(), amount, life: POP_LIFETIME })
}

export function tickSalePops(delta: number): void {
  if (pops.length === 0) return
  for (const pop of pops) {
    pop.life -= delta
    pop.position.y += RISE_SPEED * delta
  }
  pops = pops.filter((p) => p.life > 0)
}

export function getSalePops(): readonly SalePop[] {
  return pops
}
