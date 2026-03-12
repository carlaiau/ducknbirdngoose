import type { Vec3 } from '../types/game'

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const distance2D = (a: Vec3, b: Vec3) => {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return Math.hypot(dx, dz)
}

export const normalize2D = (x: number, z: number) => {
  const length = Math.hypot(x, z)
  if (length === 0) {
    return { x: 0, z: 0 }
  }

  return { x: x / length, z: z / length }
}

export const moveToward = (current: number, target: number, maxDelta: number) => {
  if (Math.abs(target - current) <= maxDelta) {
    return target
  }

  return current + Math.sign(target - current) * maxDelta
}

export const angleFromVec2 = (x: number, z: number) => Math.atan2(x, z)
