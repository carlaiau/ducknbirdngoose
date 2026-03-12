import { beforeEach, describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '../config/gameConfig'
import type { ChickState } from '../types/game'
import { useGameStore } from './gameStore'

const baseChick: ChickState = {
  id: 'test-chick',
  label: 1,
  zoneId: 'yard',
  position: [-8, 0.18, 0.8],
  facing: 0,
  mode: 'follow',
  wanderTarget: [-8, 0.18, 0.8],
  hungerState: 'sated',
  hungerAt: Number.POSITIVE_INFINITY,
  nextFeedAt: 0,
  wormsFed: GAME_CONFIG.wormsPerBaby,
  wormsNeeded: GAME_CONFIG.wormsPerBaby,
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetSession()
  })

  it('clamps zoom adjustments to the configured bounds', () => {
    const store = useGameStore.getState()

    store.adjustCameraZoom(999)
    expect(useGameStore.getState().cameraZoom).toBe(GAME_CONFIG.cameraZoom.max)

    useGameStore.getState().adjustCameraZoom(-999)
    expect(useGameStore.getState().cameraZoom).toBe(GAME_CONFIG.cameraZoom.min)
  })

  it('keeps the round open while a patrol chick is hungry', () => {
    useGameStore.setState((state) => ({
      ...state,
      phase: 'playing',
      worldTime: 0,
      eggs: [],
      chicks: [
        {
          ...baseChick,
          mode: 'patrol',
          hungerState: 'hungry',
          hungerAt: 0,
          wormsFed: 0,
        },
      ],
      worms: [],
      round: {
        number: 1,
        clutchSize: 0,
        unlockedZones: ['yard'],
        phase: 'playing',
        transitionAt: null,
      },
    }))

    useGameStore.getState().advance(0.1)

    expect(useGameStore.getState().round.phase).toBe('playing')
  })

  it('converts trailing chicks into patrol chicks when the round clears', () => {
    useGameStore.setState((state) => ({
      ...state,
      phase: 'playing',
      worldTime: 0,
      eggs: [],
      chicks: [baseChick],
      worms: [],
      round: {
        number: 1,
        clutchSize: 0,
        unlockedZones: ['yard'],
        phase: 'playing',
        transitionAt: null,
      },
    }))

    useGameStore.getState().advance(0.1)

    const gameState = useGameStore.getState()
    expect(gameState.round.phase).toBe('round-clear')
    expect(gameState.chicks[0]?.mode).toBe('patrol')
    expect(gameState.chicks[0]?.hungerState).toBe('sated')
    expect(gameState.chicks[0]?.hungerAt).toBeGreaterThan(0.1)
  })

  it('moves toward a click target until it is reached', () => {
    useGameStore.setState((state) => ({
      ...state,
      phase: 'playing',
      worldTime: 0,
      eggs: [],
      chicks: [],
      worms: [],
      moveTarget: [-6.8, GAME_CONFIG.playerSpawn[1], 1.2],
      round: {
        number: 1,
        clutchSize: 0,
        unlockedZones: ['yard'],
        phase: 'playing',
        transitionAt: null,
      },
    }))

    useGameStore.getState().advance(0.4)

    const movingState = useGameStore.getState()
    expect(movingState.player.position[0]).toBeGreaterThan(GAME_CONFIG.playerSpawn[0])
    expect(movingState.moveTarget).not.toBeNull()

    useGameStore.getState().advance(1)

    const arrivedState = useGameStore.getState()
    expect(arrivedState.player.position[0]).toBeCloseTo(-6.8)
    expect(arrivedState.moveTarget).toBeNull()
  })
})
