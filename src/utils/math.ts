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

export const resolveObstacles = (
  pos: Vec3,
  obstacles: ReadonlyArray<{ x: number; z: number; radius: number }>,
  playerRadius = 0.4,
): Vec3 => {
  let [x, y, z] = pos
  for (const obs of obstacles) {
    const dx = x - obs.x
    const dz = z - obs.z
    const dist = Math.hypot(dx, dz)
    const minDist = obs.radius + playerRadius
    if (dist < minDist) {
      const push = dist < 0.001 ? minDist : (minDist / dist)
      x = obs.x + (dist < 0.001 ? minDist : dx * push)
      z = obs.z + (dist < 0.001 ? 0 : dz * push)
    }
  }
  return [x, y, z]
}
