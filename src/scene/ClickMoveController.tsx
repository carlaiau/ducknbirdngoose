import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGameStore } from '../store/gameStore'
import { clamp } from '../utils/math'

const pointer = new Vector2()
const raycaster = new Raycaster()
const groundPlane = new Plane(new Vector3(0, 1, 0), 0)
const groundIntersection = new Vector3()

export const ClickMoveController = () => {
  const { camera, gl } = useThree()
  const phase = useGameStore((state) => state.phase)
  const setMoveTarget = useGameStore((state) => state.setMoveTarget)

  useEffect(() => {
    const canvas = gl.domElement

    const handlePointerDown = (event: PointerEvent) => {
      if (phase !== 'playing' || event.button !== 0 || event.pointerType !== 'mouse') {
        return
      }

      const bounds = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)

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

    canvas.addEventListener('pointerdown', handlePointerDown)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [camera, gl, phase, setMoveTarget])

  return null
}
