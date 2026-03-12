import type { PaletteDefinition, SpeciesId } from '../types/game'

interface SpeciesModelProps {
  speciesId: SpeciesId
  palette: PaletteDefinition
  variant?: 'adult' | 'baby'
  sleepy?: boolean
}

const PROFILES = {
  bird: {
    body: [0.78, 0.6, 1.02],
    head: [0, 0.78, 0.55],
    headSize: 0.28,
    beak: [0, 0.74, 0.92],
    beakScale: [0.16, 0.16, 0.34],
    wing: [0.52, 0.48, 0],
    wingScale: [0.18, 0.34, 0.62],
    tail: [0, 0.58, -0.82],
    tailScale: [0.18, 0.28, 0.38],
    neckScale: [0.24, 0.24, 0.24],
    legHeight: 0.34,
  },
  duck: {
    body: [0.94, 0.72, 1.18],
    head: [0, 0.88, 0.7],
    headSize: 0.34,
    beak: [0, 0.83, 1.09],
    beakScale: [0.24, 0.18, 0.38],
    wing: [0.62, 0.56, 0.05],
    wingScale: [0.22, 0.38, 0.74],
    tail: [0, 0.68, -0.95],
    tailScale: [0.22, 0.3, 0.44],
    neckScale: [0.28, 0.32, 0.28],
    legHeight: 0.36,
  },
  goose: {
    body: [1.02, 0.74, 1.25],
    head: [0, 1.36, 0.83],
    headSize: 0.3,
    beak: [0, 1.3, 1.16],
    beakScale: [0.24, 0.16, 0.42],
    wing: [0.68, 0.63, 0.04],
    wingScale: [0.22, 0.42, 0.78],
    tail: [0, 0.74, -1.03],
    tailScale: [0.24, 0.32, 0.48],
    neckScale: [0.22, 0.66, 0.22],
    legHeight: 0.42,
  },
} as const

const shadowColor = '#34292a'

export const SpeciesModel = ({
  speciesId,
  palette,
  variant = 'adult',
  sleepy = false,
}: SpeciesModelProps) => {
  const profile = PROFILES[speciesId]
  const scale = variant === 'baby' ? 0.42 : 1

  return (
    <group scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={palette.colors.body} flatShading />
      </mesh>

      <mesh castShadow position={profile.head}>
        <icosahedronGeometry args={[profile.headSize, 0]} />
        <meshStandardMaterial color={palette.colors.accent} flatShading />
      </mesh>

      <mesh castShadow position={[0, speciesId === 'goose' ? 0.92 : 0.7, 0.34]} scale={profile.neckScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.colors.body} flatShading />
      </mesh>

      <mesh castShadow position={profile.beak} scale={profile.beakScale}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color={sleepy ? palette.colors.accent : palette.colors.beak} flatShading />
      </mesh>

      {([-1, 1] as const).map((direction) => (
        <mesh
          key={`wing-${direction}`}
          castShadow
          position={[profile.wing[0] * direction, profile.wing[1], profile.wing[2]]}
          rotation={[0, 0, direction * 0.22]}
          scale={profile.wingScale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={palette.colors.wing} flatShading />
        </mesh>
      ))}

      <mesh castShadow position={profile.tail} scale={profile.tailScale} rotation={[-0.18, 0, 0]}>
        <coneGeometry args={[0.55, 1, 4]} />
        <meshStandardMaterial color={palette.colors.wing} flatShading />
      </mesh>

      {([-1, 1] as const).map((direction) => (
        <group key={`leg-${direction}`} position={[direction * 0.18, profile.legHeight, 0.18]}>
          <mesh castShadow position={[0, -profile.legHeight * 0.5, 0]} scale={[0.08, profile.legHeight, 0.08]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={palette.colors.beak} flatShading />
          </mesh>
          <mesh position={[0, -profile.legHeight, 0.12]} scale={[0.22, 0.06, 0.3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={palette.colors.beak} flatShading />
          </mesh>
        </group>
      ))}

      {([-1, 1] as const).map((direction) => (
        <mesh key={`eye-${direction}`} position={[direction * 0.11, profile.head[1] + 0.05, profile.head[2] + 0.16]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color={sleepy ? shadowColor : palette.colors.eye} flatShading />
        </mesh>
      ))}
    </group>
  )
}
