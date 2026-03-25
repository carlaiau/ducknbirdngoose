import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGameStore } from '../store/gameStore'
import type { SessionPhase } from '../types/game'
import { clamp } from '../utils/math'

const pointer = new Vector2()
const raycaster = new Raycaster()
const groundPlane = new Plane(new Vector3(0, 1, 0), 0)
const groundIntersection = new Vector3()
export const TAP_MOVE_DRIFT_THRESHOLD = 12

interface PointerLikeEvent {
  button: number
  clientX: number
  clientY: number
  pointerId: number
  pointerType: string
}

interface PendingTouchTap {
  pointerId: number
  startX: number
  startY: number
}

interface CanvasMoveHandlerOptions {
  phase: SessionPhase
  moveToClientPoint: (clientX: number, clientY: number) => void
  tapMoveDriftThreshold?: number
}

export const createCanvasMoveHandlers = ({
  phase,
  moveToClientPoint,
  tapMoveDriftThreshold = TAP_MOVE_DRIFT_THRESHOLD,
}: CanvasMoveHandlerOptions) => {
  const activeTouchPointers = new Set<number>()
  let pendingTouchTap: PendingTouchTap | null = null
  let touchGestureCancelled = false

  const resetTouchTracking = () => {
    if (activeTouchPointers.size === 0) {
      pendingTouchTap = null
      touchGestureCancelled = false
    }
  }

  const cancelTouchTap = () => {
    pendingTouchTap = null
    touchGestureCancelled = true
  }

  const getTouchDrift = (event: PointerLikeEvent) => {
    if (!pendingTouchTap) {
      return Number.POSITIVE_INFINITY
    }

    return Math.hypot(event.clientX - pendingTouchTap.startX, event.clientY - pendingTouchTap.startY)
  }

  const onPointerDown = (event: PointerLikeEvent) => {
    if (phase !== 'playing') {
      return
    }

    if (event.pointerType === 'mouse') {
      if (event.button !== 0) {
        return
      }

      moveToClientPoint(event.clientX, event.clientY)
      return
    }

    if (event.pointerType !== 'touch') {
      return
    }

    activeTouchPointers.add(event.pointerId)

    if (activeTouchPointers.size === 1) {
      pendingTouchTap = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      }
      touchGestureCancelled = false
      return
    }

    cancelTouchTap()
  }

  const onPointerMove = (event: PointerLikeEvent) => {
    if (phase !== 'playing' || event.pointerType !== 'touch' || !activeTouchPointers.has(event.pointerId)) {
      return
    }

    if (activeTouchPointers.size > 1) {
      cancelTouchTap()
      return
    }

    if (pendingTouchTap?.pointerId !== event.pointerId) {
      return
    }

    if (getTouchDrift(event) > tapMoveDriftThreshold) {
      cancelTouchTap()
    }
  }

  const onPointerUp = (event: PointerLikeEvent) => {
    if (event.pointerType !== 'touch') {
      return
    }

    const shouldCommitMove =
      phase === 'playing' &&
      activeTouchPointers.size === 1 &&
      !touchGestureCancelled &&
      pendingTouchTap?.pointerId === event.pointerId &&
      getTouchDrift(event) <= tapMoveDriftThreshold

    activeTouchPointers.delete(event.pointerId)

    if (shouldCommitMove) {
      moveToClientPoint(event.clientX, event.clientY)
    }

    if (pendingTouchTap?.pointerId === event.pointerId) {
      pendingTouchTap = null
    }

    resetTouchTracking()
  }

  const onPointerCancel = (event: PointerLikeEvent) => {
    if (event.pointerType !== 'touch') {
      return
    }

    activeTouchPointers.delete(event.pointerId)

    if (pendingTouchTap?.pointerId === event.pointerId) {
      pendingTouchTap = null
    }

    resetTouchTracking()
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}

export const ClickMoveController = () => {
  const { camera, gl } = useThree()
  const phase = useGameStore((state) => state.phase)
  const setMoveTarget = useGameStore((state) => state.setMoveTarget)

  useEffect(() => {
    const canvas = gl.domElement

    const moveToClientPoint = (clientX: number, clientY: number) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -(((clientY - bounds.top) / bounds.height) * 2 - 1)

      raycaster.setFromCamera(pointer, camera)

      if (!raycaster.ray.intersectPlane(groundPlane, groundIntersection)) {
        return
      }

      setMoveTarget([
        clamp(groundIntersection.x, GAME_CONFIG.mapBounds.minX, GAME_CONFIG.mapBounds.maxX),
        GAME_CONFIG.playerSpawn[1],
        clamp(groundIntersection.z, GAME_CONFIG.mapBounds.minZ, GAME_CONFIG.mapBounds.maxZ),
      ])
    }

    const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = createCanvasMoveHandlers({
      phase,
      moveToClientPoint,
    })

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerCancel)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [camera, gl, phase, setMoveTarget])

  return null
}
