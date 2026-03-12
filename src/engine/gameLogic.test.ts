import { describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '../config/gameConfig'
import { createClutch, createInitialWorms, getUnlockedZoneIds, pickClutchSize } from './gameLogic'

describe('gameLogic', () => {
  it('picks only 5 or 10 egg clutches', () => {
    expect(pickClutchSize(() => 0.1)).toBe(GAME_CONFIG.clutchSizes[0])
    expect(pickClutchSize(() => 0.9)).toBe(GAME_CONFIG.clutchSizes[1])
  })

  it('unlocks reeds after round 2 and dock after round 4', () => {
    expect(getUnlockedZoneIds(1)).toEqual(['yard'])
    expect(getUnlockedZoneIds(3)).toEqual(['yard', 'reeds'])
    expect(getUnlockedZoneIds(5)).toEqual(['yard', 'reeds', 'dock'])
  })

  it('creates numbered eggs with staggered hatch timing', () => {
    const clutch = createClutch(1, 12, () => 0.2)

    expect(clutch).toHaveLength(5)
    expect(clutch[0]).toMatchObject({
      label: 1,
      hatchAt: 14,
      stage: 'egg',
      wormsNeeded: 4,
    })
    expect(clutch[4]).toMatchObject({
      label: 5,
      hatchAt: 17,
    })
  })

  it('seeds worms across unlocked grass zones', () => {
    const worms = createInitialWorms(['yard', 'reeds'], () => 0.4)

    expect(worms).toHaveLength(GAME_CONFIG.wormCountTotal)
    expect(worms.every((worm) => ['yard', 'reeds'].includes(worm.zoneId))).toBe(true)
  })
})
