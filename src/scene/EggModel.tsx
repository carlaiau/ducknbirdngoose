import { useMemo } from 'react'
import { Vector2 } from 'three'

export const EggModel = () => {
  const profile = useMemo(
    () => [
      new Vector2(0, -0.92),
      new Vector2(0.28, -0.84),
      new Vector2(0.48, -0.48),
      new Vector2(0.56, -0.04),
      new Vector2(0.48, 0.38),
      new Vector2(0.3, 0.72),
      new Vector2(0.14, 0.96),
      new Vector2(0.04, 1.08),
      new Vector2(0, 1.14),
    ],
    [],
  )

  return (
    <group rotation={[0.1, 0, -0.4]}>
      <mesh castShadow scale={[0.62, 0.68, 0.62]}>
        <latheGeometry args={[profile, 24]} />
        <meshStandardMaterial color="#f8f2de" roughness={0.82} metalness={0.02} />
      </mesh>

      {[
        [-0.14, 0.04, 0.24],
        [0.18, -0.12, 0.1],
        [0.1, 0.28, -0.18],
        [-0.04, 0.44, 0.04],
      ].map((position, index) => (
        <mesh key={`spot-${index + 1}`} position={position as [number, number, number]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#d9c8a8" roughness={0.9} metalness={0.01} />
        </mesh>
      ))}
    </group>
  )
}
