import { describe, expect, it, vi } from 'vitest'
import {
  createMobileGestureHandlers,
  MOBILE_SWIPE_ROTATE_FACTOR,
  MOBILE_SWIPE_ROTATE_START_DISTANCE,
} from './GameShell'

const createTouchList = (
  touches: Array<{
    identifier: number
    clientX: number
    clientY: number
  }>,
) => ({
  length: touches.length,
  item: (index: number) => touches[index] ?? null,
})

const createTouchEvent = ({
  touches,
  target = document.createElement('canvas'),
  cancelable = true,
}: {
  touches: Array<{
    identifier: number
    clientX: number
    clientY: number
  }>
  target?: EventTarget | null
  cancelable?: boolean
}) => ({
  touches: createTouchList(touches),
  cancelable,
  target,
  preventDefault: vi.fn(),
})

describe('GameShell mobile gestures', () => {
  it('rotates the camera from a coarse-pointer single-finger swipe', () => {
    const adjustCameraZoom = vi.fn()
    const adjustCameraAngle = vi.fn()
    const handlers = createMobileGestureHandlers({
      getPhase: () => 'playing',
      getIsCoarsePointer: () => true,
      adjustCameraZoom,
      adjustCameraAngle,
    })

    handlers.onTouchStart(createTouchEvent({
      touches: [{ identifier: 1, clientX: 100, clientY: 100 }],
    }))
    handlers.onTouchMove(createTouchEvent({
      touches: [{
        identifier: 1,
        clientX: 100 + MOBILE_SWIPE_ROTATE_START_DISTANCE + 4,
        clientY: 100,
      }],
    }))

    expect(adjustCameraZoom).not.toHaveBeenCalled()
    expect(adjustCameraAngle).toHaveBeenCalledWith(
      (MOBILE_SWIPE_ROTATE_START_DISTANCE + 4) * MOBILE_SWIPE_ROTATE_FACTOR,
    )
  })

  it('does not rotate the camera for taps or small drags', () => {
    const adjustCameraAngle = vi.fn()
    const handlers = createMobileGestureHandlers({
      getPhase: () => 'playing',
      getIsCoarsePointer: () => true,
      adjustCameraZoom: vi.fn(),
      adjustCameraAngle,
    })

    handlers.onTouchStart(createTouchEvent({
      touches: [{ identifier: 1, clientX: 40, clientY: 80 }],
    }))
    handlers.onTouchMove(createTouchEvent({
      touches: [{
        identifier: 1,
        clientX: 40 + MOBILE_SWIPE_ROTATE_START_DISTANCE - 1,
        clientY: 80,
      }],
    }))

    expect(adjustCameraAngle).not.toHaveBeenCalled()
  })

  it('ignores single-finger swipes that start on UI controls', () => {
    const adjustCameraAngle = vi.fn()
    const button = document.createElement('button')
    const handlers = createMobileGestureHandlers({
      getPhase: () => 'playing',
      getIsCoarsePointer: () => true,
      adjustCameraZoom: vi.fn(),
      adjustCameraAngle,
    })

    handlers.onTouchStart(createTouchEvent({
      touches: [{ identifier: 1, clientX: 20, clientY: 20 }],
      target: button,
    }))
    handlers.onTouchMove(createTouchEvent({
      touches: [{
        identifier: 1,
        clientX: 20 + MOBILE_SWIPE_ROTATE_START_DISTANCE + 6,
        clientY: 20,
      }],
      target: button,
    }))

    expect(adjustCameraAngle).not.toHaveBeenCalled()
  })

  it('keeps pinch zoom working without treating it as a single-finger swipe', () => {
    const adjustCameraZoom = vi.fn()
    const adjustCameraAngle = vi.fn()
    const handlers = createMobileGestureHandlers({
      getPhase: () => 'playing',
      getIsCoarsePointer: () => true,
      adjustCameraZoom,
      adjustCameraAngle,
    })

    handlers.onTouchStart(createTouchEvent({
      touches: [
        { identifier: 1, clientX: 20, clientY: 20 },
        { identifier: 2, clientX: 60, clientY: 20 },
      ],
    }))
    handlers.onTouchMove(createTouchEvent({
      touches: [
        { identifier: 1, clientX: 16, clientY: 20 },
        { identifier: 2, clientX: 76, clientY: 20 },
      ],
    }))

    expect(adjustCameraZoom).toHaveBeenCalled()
    expect(adjustCameraAngle).not.toHaveBeenCalled()
  })
})
