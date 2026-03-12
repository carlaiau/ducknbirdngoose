import { GAME_CONFIG } from '../config/gameConfig'
import { NEST_SPOTS, WORM_PATCHES } from '../data/zones'
import type { ChickState, EggState, InputState, Vec3, WormPatchDefinition, WormState, ZoneId } from '../types/game'
import { normalize2D } from '../utils/math'

const STARTING_ZONES: ZoneId[] = ['yard']
const REEDS_UNLOCK_ROUND = 3
const DOCK_UNLOCK_ROUND = 5

const randomBetween = (min: number, max: number, rng: () => number = Math.random) =>
  min + rng() * (max - min)

const randomIntegerBetween = (min: number, max: number, rng: () => number = Math.random) =>
  Math.floor(randomBetween(min, max + 1, rng))

const pickMiddleHatchDelay = (rng: () => number = Math.random) => {
  const { middleMin, middleMax, slowMin, slowMax, slowChance } = GAME_CONFIG.hatchDelay

  if (rng() < slowChance) {
    return randomBetween(slowMin, slowMax, rng)
  }

  return randomBetween(middleMin, middleMax, rng)
}

const createHatchDelays = (clutchSize: number, rng: () => number = Math.random) => {
  const { quickMin, quickMax, middleMin, middleMax } = GAME_CONFIG.hatchDelay
  const delays = [
    randomBetween(quickMin, quickMax, rng),
    randomBetween(middleMin, middleMax, rng),
    ...Array.from({ length: clutchSize - 2 }, () => pickMiddleHatchDelay(rng)),
  ]

  return shuffleWithRng(delays, rng)
}

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
  randomIntegerBetween(GAME_CONFIG.clutchSizeRange.min, GAME_CONFIG.clutchSizeRange.max, rng)

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
  startLabel = 1,
  rng: () => number = Math.random,
): EggState[] => {
  const unlockedZones = getUnlockedZoneIds(roundNumber)
  const clutchSize = pickClutchSize(rng)
  const availableSpots = shuffleWithRng(
    NEST_SPOTS.filter((spot) => unlockedZones.includes(spot.zoneId)),
    rng,
  ).slice(0, clutchSize)
  const hatchDelays = createHatchDelays(clutchSize, rng)

  return availableSpots.map((spot, index) => ({
    id: `round-${roundNumber}-egg-${index + 1}`,
    label: startLabel + index,
    zoneId: spot.zoneId,
    position: [...spot.position] as Vec3,
    hatchAt: worldTime + hatchDelays[index],
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

export const createFollowChickFromEgg = (
  egg: EggState,
  facing: number,
): ChickState => ({
  id: `${egg.id}-chick`,
  label: egg.label,
  zoneId: egg.zoneId,
  position: [...egg.position] as Vec3,
  facing,
  mode: 'follow',
  wanderTarget: [...egg.position] as Vec3,
  hungerState: 'sated',
  hungerAt: Number.POSITIVE_INFINITY,
  nextFeedAt: 0,
  wormsFed: egg.wormsNeeded,
  wormsNeeded: egg.wormsNeeded,
})

export const pickPatrolHungerDelay = (rng: () => number = Math.random) =>
  randomBetween(GAME_CONFIG.patrolHungryDelay.min, GAME_CONFIG.patrolHungryDelay.max, rng)

export const promoteChicksToPatrol = (
  chicks: ChickState[],
  worldTime: number,
  rng: () => number = Math.random,
) =>
  chicks.map((chick) => {
    if (chick.mode === 'patrol') {
      return chick
    }

    return {
      ...chick,
      mode: 'patrol' as const,
      wanderTarget: randomPointInZone(chick.zoneId, rng),
      hungerState: 'sated' as const,
      hungerAt: worldTime + pickPatrolHungerDelay(rng),
      nextFeedAt: 0,
      wormsFed: 0,
    }
  })

export const getHungryPatrolCount = (chicks: ChickState[]) =>
  chicks.filter((chick) => chick.mode === 'patrol' && chick.hungerState === 'hungry').length

export const hasPendingRoundGoals = (eggs: EggState[], chicks: ChickState[]) =>
  eggs.length > 0 || getHungryPatrolCount(chicks) > 0

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
