import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// y offsets lift each model so its bottom sits at world y=0
// derived from the measured minY of each GLB's bounding box
const Y_OFFSETS: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.14,
  4: 1.0,
  5: 1.86,
}

interface HouseModelProps {
  modelIndex: 1 | 2 | 3 | 4 | 5
  position: [number, number, number]
  rotationY?: number
}

export const HouseModel = ({ modelIndex, position, rotationY = 0 }: HouseModelProps) => {
  const path = `/assets/models/houses/${modelIndex}.glb`
  const { scene } = useGLTF(path)
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return c
  }, [scene])

  const [x, , z] = position
  const y = Y_OFFSETS[modelIndex] ?? 1.0

  return <primitive object={clone} position={[x, y, z]} rotation={[0, rotationY, 0]} />
}

// Preload all house models at startup
for (let i = 1; i <= 5; i++) {
  useGLTF.preload(`/assets/models/houses/${i}.glb`)
}
