import type { RefObject } from 'react'
import type { OrthographicCamera } from 'three'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

// Orbit radius in the XZ plane — keeps the same distance as the original [16,15,16] offset
const ORBIT_RADIUS = Math.sqrt(16 * 16 + 16 * 16)
const ORBIT_Y = 15

interface IsometricCameraRigProps {
  cameraRef: RefObject<OrthographicCamera | null>
}

export const IsometricCameraRig = ({ cameraRef }: IsometricCameraRigProps) => {
  const playerPosition = useGameStore((state) => state.player.position)
  const cameraZoom = useGameStore((state) => state.cameraZoom)
  const cameraAngle = useGameStore((state) => state.cameraAngle)

  useFrame(() => {
    const camera = cameraRef.current
    if (!camera) {
      return
    }

    const targetX = playerPosition[0] + Math.cos(cameraAngle) * ORBIT_RADIUS
    const targetY = ORBIT_Y
    const targetZ = playerPosition[2] + Math.sin(cameraAngle) * ORBIT_RADIUS

    camera.position.x += (targetX - camera.position.x) * 0.06
    camera.position.y += (targetY - camera.position.y) * 0.06
    camera.position.z += (targetZ - camera.position.z) * 0.06
    camera.zoom += (cameraZoom - camera.zoom) * 0.16
    camera.updateProjectionMatrix()
    camera.lookAt(playerPosition[0], 0.4, playerPosition[2])
  })

  return null
}
