import { AdaptiveDpr, OrthographicCamera } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { OrthographicCamera as ThreeOrthographicCamera } from 'three'
import { useGameStore } from '../store/gameStore'
import { ClickMoveController } from './ClickMoveController'
import { FarmWorld } from './FarmWorld'
import { IsometricCameraRig } from './IsometricCameraRig'

const GameLoop = () => {
  const advance = useGameStore((state) => state.advance)

  useFrame((_, delta) => {
    advance(Math.min(delta, 0.05))
  })

  return null
}

export default function GameScene() {
  const cameraRef = useRef<ThreeOrthographicCamera>(null)

  return (
    <Canvas
      className="scene-canvas"
      orthographic
      shadows
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#91bdf2']} />
      <fog attach="fog" args={['#91bdf2', 18, 42]} />
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        near={0.1}
        far={100}
        position={[16, 15, 16]}
        zoom={38}
      />
      <ambientLight intensity={1.2} />
      <hemisphereLight groundColor="#7d8c61" intensity={0.8} color="#d7f3ff" />
      <directionalLight
        castShadow
        position={[10, 18, 8]}
        intensity={1.9}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <AdaptiveDpr pixelated />
      <ClickMoveController />
      <FarmWorld />
      <IsometricCameraRig cameraRef={cameraRef} />
      <GameLoop />
    </Canvas>
  )
}
