import { lazy, Suspense, useEffect, useEffectEvent, useRef } from 'react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGameStore } from '../store/gameStore'
import { useGameInput } from '../hooks/useGameInput'
import { useCoarsePointer } from '../hooks/useCoarsePointer'
import type { SessionPhase } from '../types/game'
import { delayImport } from '../utils/delayImport'
import { Hud } from './Hud'
import { LoadingScreen } from './LoadingScreen'
import { SelectionPanel } from './SelectionPanel'

const LazyGameScene = lazy(() => delayImport(import('../scene/GameScene'), 720))
const PINCH_STEP_DISTANCE = 14
export const MOBILE_SWIPE_ROTATE_START_DISTANCE = 12
export const MOBILE_SWIPE_ROTATE_FACTOR = 0.01
const MOBILE_ROTATE_IGNORED_SELECTOR =
  "[data-ui-touch='true'], button, a, input, textarea, select, label"

interface TouchPointLike {
  identifier: number
  clientX: number
  clientY: number
}

interface TouchListLike {
  length: number
  item(index: number): TouchPointLike | null
}

interface TouchLikeEvent {
  touches: TouchListLike
  cancelable: boolean
  target: EventTarget | null
  preventDefault(): void
}

interface SingleTouchGesture {
  identifier: number
  startX: number
  startY: number
  lastX: number
}

interface MobileGestureHandlerOptions {
  getPhase: () => SessionPhase
  getIsCoarsePointer: () => boolean
  adjustCameraZoom: (delta: number) => void
  adjustCameraAngle: (delta: number) => void
}

const getTouchDistanceLike = (touches: TouchListLike) => {
  const first = touches.item(0)
  const second = touches.item(1)
  if (!first || !second) return 0
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
}

const getTouchAngleLike = (touches: TouchListLike) => {
  const first = touches.item(0)
  const second = touches.item(1)
  if (!first || !second) return 0
  return Math.atan2(second.clientY - first.clientY, second.clientX - first.clientX)
}

const findTouchByIdentifier = (touches: TouchListLike, identifier: number) => {
  for (let index = 0; index < touches.length; index += 1) {
    const touch = touches.item(index)
    if (touch?.identifier === identifier) {
      return touch
    }
  }

  return null
}

export const shouldRotateOnTouchTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return true
  }

  return target.closest(MOBILE_ROTATE_IGNORED_SELECTOR) === null
}

export const createMobileGestureHandlers = ({
  getPhase,
  getIsCoarsePointer,
  adjustCameraZoom,
  adjustCameraAngle,
}: MobileGestureHandlerOptions) => {
  let pinchDistance: number | null = null
  let pinchAngle: number | null = null
  let singleTouchGesture: SingleTouchGesture | null = null
  let singleTouchCanRotate = false

  const resetPinch = () => {
    pinchDistance = null
    pinchAngle = null
  }

  const resetSingleTouch = () => {
    singleTouchGesture = null
    singleTouchCanRotate = false
  }

  const onTouchStart = (event: TouchLikeEvent) => {
    const phase = getPhase()
    const isCoarsePointer = getIsCoarsePointer()

    if (phase !== 'playing') {
      resetPinch()
      resetSingleTouch()
      return
    }

    if (event.touches.length >= 2) {
      resetSingleTouch()

      if (event.cancelable) {
        event.preventDefault()
      }

      pinchDistance = getTouchDistanceLike(event.touches)
      pinchAngle = getTouchAngleLike(event.touches)
      return
    }

    resetPinch()

    if (!isCoarsePointer || event.touches.length !== 1) {
      resetSingleTouch()
      return
    }

    const touch = event.touches.item(0)

    if (!touch) {
      resetSingleTouch()
      return
    }

    singleTouchGesture = {
      identifier: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
    }
    singleTouchCanRotate = shouldRotateOnTouchTarget(event.target)
  }

  const onTouchMove = (event: TouchLikeEvent) => {
    const phase = getPhase()
    const isCoarsePointer = getIsCoarsePointer()

    if (phase !== 'playing') {
      resetPinch()
      resetSingleTouch()
      return
    }

    if (event.touches.length >= 2) {
      resetSingleTouch()

      if (event.cancelable) {
        event.preventDefault()
      }

      const nextDistance = getTouchDistanceLike(event.touches)
      const previousDistance = pinchDistance
      pinchDistance = nextDistance

      if (previousDistance != null) {
        const distanceDelta = nextDistance - previousDistance
        const stepCount = Math.trunc(Math.abs(distanceDelta) / PINCH_STEP_DISTANCE)

        if (stepCount >= 1) {
          adjustCameraZoom(Math.sign(distanceDelta) * GAME_CONFIG.cameraZoom.step * stepCount)
        }
      }

      const nextAngle = getTouchAngleLike(event.touches)
      const previousAngle = pinchAngle
      pinchAngle = nextAngle

      if (previousAngle != null) {
        let angleDelta = nextAngle - previousAngle

        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2

        if (Math.abs(angleDelta) > 0.005) {
          adjustCameraAngle(angleDelta)
        }
      }

      return
    }

    resetPinch()

    if (!isCoarsePointer || event.touches.length !== 1 || !singleTouchGesture || !singleTouchCanRotate) {
      return
    }

    const touch =
      findTouchByIdentifier(event.touches, singleTouchGesture.identifier) ?? event.touches.item(0)

    if (!touch) {
      resetSingleTouch()
      return
    }

    const totalDrift = Math.hypot(
      touch.clientX - singleTouchGesture.startX,
      touch.clientY - singleTouchGesture.startY,
    )
    const deltaX = touch.clientX - singleTouchGesture.lastX
    singleTouchGesture.lastX = touch.clientX

    if (totalDrift < MOBILE_SWIPE_ROTATE_START_DISTANCE || Math.abs(deltaX) < 0.5) {
      return
    }

    if (event.cancelable) {
      event.preventDefault()
    }

    adjustCameraAngle(deltaX * MOBILE_SWIPE_ROTATE_FACTOR)
  }

  const onTouchEnd = () => {
    resetPinch()
    resetSingleTouch()
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

export const GameShell = () => {
  useGameInput()

  const shellRef = useRef<HTMLDivElement>(null)
  const gestureHandlersRef = useRef<ReturnType<typeof createMobileGestureHandlers> | null>(null)
  const isCoarsePointer = useCoarsePointer()
  const phase = useGameStore((state) => state.phase)
  const roundPhase = useGameStore((state) => state.round.phase)
  const roundNumber = useGameStore((state) => state.round.number)
  const adjustCameraZoom = useGameStore((state) => state.adjustCameraZoom)
  const adjustCameraAngle = useGameStore((state) => state.adjustCameraAngle)
  const resetSession = useGameStore((state) => state.resetSession)
  const phaseRef = useRef(phase)
  const coarsePointerRef = useRef(isCoarsePointer)
  const adjustCameraZoomRef = useRef(adjustCameraZoom)
  const adjustCameraAngleRef = useRef(adjustCameraAngle)

  phaseRef.current = phase
  coarsePointerRef.current = isCoarsePointer
  adjustCameraZoomRef.current = adjustCameraZoom
  adjustCameraAngleRef.current = adjustCameraAngle

  if (gestureHandlersRef.current === null) {
    gestureHandlersRef.current = createMobileGestureHandlers({
      getPhase: () => phaseRef.current,
      getIsCoarsePointer: () => coarsePointerRef.current,
      adjustCameraZoom: (delta) => adjustCameraZoomRef.current(delta),
      adjustCameraAngle: (delta) => adjustCameraAngleRef.current(delta),
    })
  }

  const handleTouchStart = useEffectEvent((event: TouchEvent) => {
    gestureHandlersRef.current?.onTouchStart(event)
  })

  const handleTouchMove = useEffectEvent((event: TouchEvent) => {
    gestureHandlersRef.current?.onTouchMove(event)
  })

  const handleTouchEnd = useEffectEvent(() => {
    gestureHandlersRef.current?.onTouchEnd()
  })

  useEffect(() => {
    const shell = shellRef.current

    if (!shell) {
      return
    }

    const onTouchStart = (event: TouchEvent) => handleTouchStart(event)
    const onTouchMove = (event: TouchEvent) => handleTouchMove(event)
    const onTouchEnd = () => handleTouchEnd()

    shell.addEventListener('touchstart', onTouchStart, { passive: false })
    shell.addEventListener('touchmove', onTouchMove, { passive: false })
    shell.addEventListener('touchend', onTouchEnd)
    shell.addEventListener('touchcancel', onTouchEnd)

    return () => {
      shell.removeEventListener('touchstart', onTouchStart)
      shell.removeEventListener('touchmove', onTouchMove)
      shell.removeEventListener('touchend', onTouchEnd)
      shell.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  return (
    <div
      ref={shellRef}
      className="app-shell"
      onWheelCapture={(event) => {
        if (phase !== 'playing') {
          return
        }

        event.preventDefault()
        if (event.deltaY !== 0) {
          adjustCameraZoom(-Math.sign(event.deltaY) * GAME_CONFIG.cameraZoom.step)
        }
        if (Math.abs(event.deltaX) > 1) {
          adjustCameraAngle(event.deltaX * 0.01)
        }
      }}
    >
      <Suspense fallback={<LoadingScreen message="Loading Frankie’s farm..." />}>
        <LazyGameScene />
      </Suspense>

      {phase === 'menu' ? <SelectionPanel /> : null}

      <div className="hud-layer">
        {phase === 'playing' ? <Hud /> : <div />}

        {phase === 'playing' && !isCoarsePointer ? (
          <div className="bottom-tools">
            <div className="tool-tray" data-ui-touch="true">
              <div className="chip-row">
                <button type="button" className="chip-button" onClick={resetSession}>
                  Back to picker
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {phase === 'playing' && roundPhase === 'round-clear' ? (
        <div className="round-banner-wrap">
          <div className="round-banner">
            <div className="eyebrow">Round cleared</div>
            <strong>Round {roundNumber + 1} is arriving</strong>
          </div>
        </div>
      ) : null}
    </div>
  )
}
