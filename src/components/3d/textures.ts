import * as THREE from 'three'

// Procedural canvas textures — no external image assets. A subtle checker
// + speckle pattern reads as a real floor surface instead of a flat color,
// at zero asset-pipeline cost. Cached as module-level singletons so every
// Floor tile / the Ground plane shares one GPU texture rather than each
// allocating its own.

function buildFloorCanvas(): HTMLCanvasElement {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#cdc6b8'
  ctx.fillRect(0, 0, size, size)

  const half = size / 2
  ctx.fillStyle = 'rgba(0,0,0,0.035)'
  ctx.fillRect(0, 0, half, half)
  ctx.fillRect(half, half, half, half)

  ctx.fillStyle = 'rgba(0,0,0,0.07)'
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 0.5 + Math.random() * 1.4
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 0.5 + Math.random() * 1.2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

let floorTexture: THREE.Texture | null = null
let groundTexture: THREE.Texture | null = null

export function getFloorTileTexture(): THREE.Texture {
  if (!floorTexture) {
    floorTexture = new THREE.CanvasTexture(buildFloorCanvas())
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
    floorTexture.colorSpace = THREE.SRGBColorSpace
    floorTexture.repeat.set(1, 1)
  }
  return floorTexture
}

export function getGroundTexture(repeat: number): THREE.Texture {
  if (!groundTexture) {
    groundTexture = new THREE.CanvasTexture(buildFloorCanvas())
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping
    groundTexture.colorSpace = THREE.SRGBColorSpace
  }
  groundTexture.repeat.set(repeat, repeat)
  return groundTexture
}
