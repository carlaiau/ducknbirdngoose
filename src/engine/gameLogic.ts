import { GAME_CONFIG } from '../config/gameConfig'
import { NEST_SPOTS, WORM_PATCHES } from '../data/zones'
import type { EggState, InputState, Vec3, WormPatchDefinition, WormState, ZoneId } from '../types/game'
import { normalize2D } from '../utils/math'

const STARTING_ZONES: ZoneId[] = ['yard']
const REEDS_UNLOCK_ROUND = 3
const DOCK_UNLOCK_ROUND = 5

export const getUnlockedZoneIds = (roundNumber: number): ZoneId[] => {
  const zones = [...STARTING_ZONES]

  if (roundNumber >= REEDS_UNLOCK_ROUND) {
    zones.push('reeds')
  }

  if (roundNumber >= DOCK_UNLOCK_ROUND) {
    zones.push('dock')
  }

  return zones
}

export const pickClutchSize = (rng: () => number = Math.random) =>
  rng() < 0.5 ? GAME_CONFIG.clutchSizes[0] : GAME_CONFIG.clutchSizes[1]

export const shuffleWithRng = <T>(items: T[], rng: () => number = Math.random) => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    const value = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = value
  }

  return copy
}

export const createClutch = (
  roundNumber: number,
  worldTime: number,
  rng: () => number = Math.random,
): EggState[] => {
  const unlockedZones = getUnlockedZoneIds(roundNumber)
  const clutchSize = pickClutchSize(rng)
  const availableSpots = shuffleWithRng(
    NEST_SPOTS.filter((spot) => unlockedZones.includes(spot.zoneId)),
    rng,
  ).slice(0, clutchSize)

  return availableSpots.map((spot, index) => ({
    id: `round-${roundNumber}-egg-${index + 1}`,
    label: index + 1,
    zoneId: spot.zoneId,
    position: [...spot.position] as Vec3,
    hatchAt: worldTime + GAME_CONFIG.hatchWarmup + index * GAME_CONFIG.hatchStagger,
    nextFeedAt: 0,
    wormsFed: 0,
    wormsNeeded: GAME_CONFIG.wormsPerBaby,
    stage: 'egg',
  }))
}

export const createInitialWorms = (
  unlockedZones: ZoneId[],
  rng: () => number = Math.random,
): WormState[] =>
  Array.from({ length: GAME_CONFIG.wormCountTotal }, (_, index) =>
    spawnWorm(`worm-${index + 1}`, unlockedZones, 0, rng),
  )

export const spawnWorm = (
  id: string,
  unlockedZones: ZoneId[],
  availableAt: number,
  rng: () => number = Math.random,
): WormState => {
  const { zoneId, position, wanderTarget } = randomPointInUnlockedZones(unlockedZones, rng)

  return {
    id,
    zoneId,
    position,
    wanderTarget,
    availableAt,
    active: availableAt === 0,
  }
}

const getAvailableWormPatches = (unlockedZones: ZoneId[]) =>
  WORM_PATCHES.filter((patch) => unlockedZones.includes(patch.zoneId))

export const randomPointInPatch = (
  patch: WormPatchDefinition,
  rng: () => number = Math.random,
): Vec3 => {
  return [
    patch.minX + rng() * (patch.maxX - patch.minX),
    0.16 + rng() * 0.04,
    patch.minZ + rng() * (patch.maxZ - patch.minZ),
  ]
}

export const randomPointInZone = (
  zoneId: ZoneId,
  rng: () => number = Math.random,
): Vec3 => {
  const zonePatches = WORM_PATCHES.filter((patch) => patch.zoneId === zoneId)
  const patch = zonePatches[Math.floor(rng() * zonePatches.length)] ?? WORM_PATCHES[0]
  return randomPointInPatch(patch, rng)
}

export const randomPointInUnlockedZones = (
  unlockedZones: ZoneId[],
  rng: () => number = Math.random,
) => {
  const availablePatches = getAvailableWormPatches(unlockedZones)
  const patch = availablePatches[Math.floor(rng() * availablePatches.length)] ?? WORM_PATCHES[0]

  return {
    zoneId: patch.zoneId,
    position: randomPointInPatch(patch, rng),
    wanderTarget: randomPointInPatch(patch, rng),
  }
}

export const allBabiesFed = (eggs: EggState[]) => eggs.length === 0

export const inputToWorldVector = (input: InputState) => {
  let x = 0
  let z = 0

  if (input.up) {
    x -= 1
    z -= 1
  }
  if (input.right) {
    x += 1
    z -= 1
  }
  if (input.down) {
    x += 1
    z += 1
  }
  if (input.left) {
    x -= 1
    z += 1
  }

  return normalize2D(x, z)
}
