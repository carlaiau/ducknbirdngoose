import { beforeEach, describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGameStore } from './gameStore'

describe('gameStore camera zoom', () => {
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
})
