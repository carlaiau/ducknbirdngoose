import { useMemo } from 'react'
import { Vector2 } from 'three'

export const EggModel = () => {
  const profile = useMemo(
    () => [
      new Vector2(0, -0.82),
      new Vector2(0.22, -0.74),
      new Vector2(0.34, -0.42),
      new Vector2(0.42, 0),
      new Vector2(0.32, 0.44),
      new Vector2(0.16, 0.72),
      new Vector2(0, 0.82),
    ],
    [],
  )

  return (
    <group>
      <mesh castShadow scale={[0.72, 0.9, 0.72]}>
        <latheGeometry args={[profile, 10]} />
        <meshStandardMaterial color="#f8f2de" flatShading />
      </mesh>

      {[
        [-0.12, 0.18, 0.28],
        [0.2, -0.04, 0.18],
        [0.08, 0.38, -0.14],
      ].map((position, index) => (
        <mesh key={`spot-${index + 1}`} position={position as [number, number, number]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#d9c8a8" flatShading />
        </mesh>
      ))}
    </group>
  )
}
