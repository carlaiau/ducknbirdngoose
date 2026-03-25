import { lazy, Suspense, useEffect, useEffectEvent, useRef } from 'react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGameStore } from '../store/gameStore'
import { useGameInput } from '../hooks/useGameInput'
import { useCoarsePointer } from '../hooks/useCoarsePointer'
import { delayImport } from '../utils/delayImport'
import { Hud } from './Hud'
import { LoadingScreen } from './LoadingScreen'
import { SelectionPanel } from './SelectionPanel'

const LazyGameScene = lazy(() => delayImport(import('../scene/GameScene'), 720))
const PINCH_STEP_DISTANCE = 14

const getTouchDistance = (touches: TouchList) => {
  const first = touches.item(0)
  const second = touches.item(1)
  if (!first || !second) return 0
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
}

const getTouchAngle = (touches: TouchList) => {
  const first = touches.item(0)
  const second = touches.item(1)
  if (!first || !second) return 0
  return Math.atan2(second.clientY - first.clientY, second.clientX - first.clientX)
}

export const GameShell = () => {
  useGameInput()

  const shellRef = useRef<HTMLDivElement>(null)
  const pinchDistanceRef = useRef<number | null>(null)
  const pinchAngleRef = useRef<number | null>(null)
  const isCoarsePointer = useCoarsePointer()
  const phase = useGameStore((state) => state.phase)
  const roundPhase = useGameStore((state) => state.round.phase)
  const roundNumber = useGameStore((state) => state.round.number)
  const adjustCameraZoom = useGameStore((state) => state.adjustCameraZoom)
  const adjustCameraAngle = useGameStore((state) => state.adjustCameraAngle)
  const resetSession = useGameStore((state) => state.resetSession)
  

  const resetPinch = useEffectEvent(() => {
    pinchDistanceRef.current = null
    pinchAngleRef.current = null
  })

  const handleTouchStart = useEffectEvent((event: TouchEvent) => {
    if (phase !== 'playing' || event.touches.length < 2) {
      if (event.touches.length < 2) {
        pinchDistanceRef.current = null
        pinchAngleRef.current = null
      }
      return
    }

    if (event.cancelable) {
      event.preventDefault()
    }

    pinchDistanceRef.current = getTouchDistance(event.touches)
    pinchAngleRef.current = getTouchAngle(event.touches)
  })

  const handleTouchMove = useEffectEvent((event: TouchEvent) => {
    if (phase !== 'playing' || event.touches.length < 2) {
      pinchDistanceRef.current = null
      pinchAngleRef.current = null
      return
    }

    if (event.cancelable) {
      event.preventDefault()
    }

    // Pinch-to-zoom
    const nextDistance = getTouchDistance(event.touches)
    const previousDistance = pinchDistanceRef.current
    pinchDistanceRef.current = nextDistance

    if (previousDistance != null) {
      const distanceDelta = nextDistance - previousDistance
      const stepCount = Math.trunc(Math.abs(distanceDelta) / PINCH_STEP_DISTANCE)
      if (stepCount >= 1) {
        adjustCameraZoom(Math.sign(distanceDelta) * GAME_CONFIG.cameraZoom.step * stepCount)
      }
    }

    // Twist-to-rotate
    const nextAngle = getTouchAngle(event.touches)
    const previousAngle = pinchAngleRef.current
    pinchAngleRef.current = nextAngle

    if (previousAngle != null) {
      let angleDelta = nextAngle - previousAngle
      // Wrap to [-π, π] to handle the atan2 discontinuity
      if (angleDelta > Math.PI) angleDelta -= Math.PI * 2
      if (angleDelta < -Math.PI) angleDelta += Math.PI * 2
      if (Math.abs(angleDelta) > 0.005) {
        adjustCameraAngle(angleDelta)
      }
    }
  })

  useEffect(() => {
    const shell = shellRef.current

    if (!shell) {
      return
    }

    const onTouchStart = (event: TouchEvent) => handleTouchStart(event)
    const onTouchMove = (event: TouchEvent) => handleTouchMove(event)
    const onTouchEnd = () => resetPinch()

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
