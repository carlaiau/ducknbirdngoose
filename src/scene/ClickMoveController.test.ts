import { describe, expect, it, vi } from 'vitest'
import { createCanvasMoveHandlers, TAP_MOVE_DRIFT_THRESHOLD } from './ClickMoveController'

const createPointerEvent = (
  overrides: Partial<{
    button: number
    clientX: number
    clientY: number
    pointerId: number
    pointerType: string
  }> = {},
) => ({
  button: 0,
  clientX: 120,
  clientY: 180,
  pointerId: 1,
  pointerType: 'mouse',
  ...overrides,
})

describe('ClickMoveController gesture handling', () => {
  it('moves immediately on left mouse down', () => {
    const moveToClientPoint = vi.fn()
    const handlers = createCanvasMoveHandlers({
      phase: 'playing',
      moveToClientPoint,
    })

    handlers.onPointerDown(createPointerEvent())

    expect(moveToClientPoint).toHaveBeenCalledWith(120, 180)
  })

  it('moves on a single-finger tap when the touch ends', () => {
    const moveToClientPoint = vi.fn()
    const handlers = createCanvasMoveHandlers({
      phase: 'playing',
      moveToClientPoint,
    })

    handlers.onPointerDown(createPointerEvent({
      pointerType: 'touch',
      clientX: 84,
      clientY: 96,
    }))
    handlers.onPointerUp(createPointerEvent({
      pointerType: 'touch',
      clientX: 86,
      clientY: 100,
    }))

    expect(moveToClientPoint).toHaveBeenCalledWith(86, 100)
  })

  it('cancels tap-to-move when a second touch starts', () => {
    const moveToClientPoint = vi.fn()
    const handlers = createCanvasMoveHandlers({
      phase: 'playing',
      moveToClientPoint,
    })

    handlers.onPointerDown(createPointerEvent({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 40,
      clientY: 50,
    }))
    handlers.onPointerDown(createPointerEvent({
      pointerType: 'touch',
      pointerId: 2,
      clientX: 72,
      clientY: 54,
    }))
    handlers.onPointerUp(createPointerEvent({
      pointerType: 'touch',
      pointerId: 2,
      clientX: 72,
      clientY: 54,
    }))
    handlers.onPointerUp(createPointerEvent({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 40,
      clientY: 50,
    }))

    expect(moveToClientPoint).not.toHaveBeenCalled()
  })

  it('does not move when a touch drifts beyond the tap threshold', () => {
    const moveToClientPoint = vi.fn()
    const handlers = createCanvasMoveHandlers({
      phase: 'playing',
      moveToClientPoint,
    })

    handlers.onPointerDown(createPointerEvent({
      pointerType: 'touch',
      clientX: 20,
      clientY: 20,
    }))
    handlers.onPointerMove(createPointerEvent({
      pointerType: 'touch',
      clientX: 20 + TAP_MOVE_DRIFT_THRESHOLD + 1,
      clientY: 20,
    }))
    handlers.onPointerUp(createPointerEvent({
      pointerType: 'touch',
      clientX: 20 + TAP_MOVE_DRIFT_THRESHOLD + 1,
      clientY: 20,
    }))

    expect(moveToClientPoint).not.toHaveBeenCalled()
  })

  it('does not create a stray move target during a pinch gesture', () => {
    const moveToClientPoint = vi.fn()
    const handlers = createCanvasMoveHandlers({
      phase: 'playing',
      moveToClientPoint,
    })

    handlers.onPointerDown(createPointerEvent({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 60,
      clientY: 80,
    }))
    handlers.onPointerDown(createPointerEvent({
      pointerType: 'touch',
      pointerId: 2,
      clientX: 96,
      clientY: 80,
    }))
    handlers.onPointerMove(createPointerEvent({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 48,
      clientY: 80,
    }))
    handlers.onPointerMove(createPointerEvent({
      pointerType: 'touch',
      pointerId: 2,
      clientX: 108,
      clientY: 80,
    }))
    handlers.onPointerUp(createPointerEvent({
      pointerType: 'touch',
      pointerId: 1,
      clientX: 48,
      clientY: 80,
    }))
    handlers.onPointerUp(createPointerEvent({
      pointerType: 'touch',
      pointerId: 2,
      clientX: 108,
      clientY: 80,
    }))

    expect(moveToClientPoint).not.toHaveBeenCalled()
  })
})
