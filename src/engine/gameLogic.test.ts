import { describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '../config/gameConfig'
import {
  createClutch,
  createFollowChickFromEgg,
  createInitialWorms,
  getHungryPatrolCount,
  getUnlockedZoneIds,
  hasPendingRoundGoals,
  pickClutchSize,
  promoteChicksToPatrol,
} from './gameLogic'

describe('gameLogic', () => {
  it('picks only 3 to 6 egg clutches', () => {
    expect(pickClutchSize(() => 0)).toBe(GAME_CONFIG.clutchSizeRange.min)
    expect(pickClutchSize(() => 0.99)).toBe(GAME_CONFIG.clutchSizeRange.max)
  })

  it('unlocks reeds after round 2 and dock after round 4', () => {
    expect(getUnlockedZoneIds(1)).toEqual(['yard'])
    expect(getUnlockedZoneIds(3)).toEqual(['yard', 'reeds'])
    expect(getUnlockedZoneIds(5)).toEqual(['yard', 'reeds', 'dock'])
  })

  it('creates numbered eggs with mixed quick and slow hatch timing', () => {
    const clutch = createClutch(1, 12, 20, () => 0)
    const hatchDelays = clutch
      .map((egg) => egg.hatchAt - 12)
      .sort((left, right) => left - right)

    expect(clutch).toHaveLength(3)
    expect(clutch.map((egg) => egg.label)).toEqual([20, 21, 22])
    expect(hatchDelays[0]).toBeGreaterThanOrEqual(GAME_CONFIG.hatchDelay.quickMin)
    expect(hatchDelays[0]).toBeLessThanOrEqual(GAME_CONFIG.hatchDelay.quickMax)
    expect(hatchDelays.at(-1)).toBeGreaterThanOrEqual(GAME_CONFIG.hatchDelay.slowMin)
    expect(hatchDelays.at(-1)).toBeLessThanOrEqual(GAME_CONFIG.hatchDelay.slowMax)
    expect(clutch.every((egg) => egg.stage === 'egg' && egg.wormsNeeded === GAME_CONFIG.wormsPerBaby)).toBe(true)
  })

  it('does not force every clutch to include a slow hatch egg', () => {
    const clutch = createClutch(1, 12, 20, () => 0.9)
    const hatchDelays = clutch
      .map((egg) => egg.hatchAt - 12)
      .sort((left, right) => left - right)

    expect(hatchDelays[0]).toBeGreaterThanOrEqual(GAME_CONFIG.hatchDelay.quickMin)
    expect(hatchDelays[0]).toBeLessThanOrEqual(GAME_CONFIG.hatchDelay.quickMax)
    expect(hatchDelays.at(-1)).toBeLessThanOrEqual(GAME_CONFIG.hatchDelay.middleMax)
  })

  it('seeds worms across unlocked grass zones', () => {
    const worms = createInitialWorms(['yard', 'reeds'], () => 0.4)

    expect(worms).toHaveLength(GAME_CONFIG.wormCountTotal)
    expect(worms.every((worm) => ['yard', 'reeds'].includes(worm.zoneId))).toBe(true)
  })

  it('treats hungry patrol chicks as active round goals', () => {
    const egg = createClutch(1, 0, 1, () => 0)[0]
    const followChick = createFollowChickFromEgg({ ...egg, stage: 'baby' }, 0.25)
    const [patrolChick] = promoteChicksToPatrol([followChick], 15, () => 0)
    const hungryPatrol = {
      ...patrolChick,
      hungerState: 'hungry' as const,
      hungerAt: 15,
    }

    expect(getHungryPatrolCount([patrolChick])).toBe(0)
    expect(getHungryPatrolCount([hungryPatrol])).toBe(1)
    expect(hasPendingRoundGoals([], [hungryPatrol])).toBe(true)
    expect(hasPendingRoundGoals([], [patrolChick])).toBe(false)
  })
})
