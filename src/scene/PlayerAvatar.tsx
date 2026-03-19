import { useMemo } from 'react'
import { useGameStore, useSelectedPalette } from '../store/gameStore'
import { useSelectedSpecies } from '../store/gameStore'
import { PersonModel } from './PersonModel'
import { SpeciesModel } from './SpeciesModel'

export const PlayerAvatar = () => {
  const species = useSelectedSpecies()
  const palette = useSelectedPalette()
  const characterMode = useGameStore((state) => state.characterMode)
  const player = useGameStore((state) => state.player)
  const moveTarget = useGameStore((state) => state.moveTarget)
  const input = useGameStore((state) => state.input)
  const worldTime = useGameStore((state) => state.worldTime)

  const isMoving = input.up || input.right || input.down || input.left || moveTarget !== null
  const yOffset = useMemo(
    () => 0.2 + (isMoving ? Math.sin(worldTime * 11) * 0.06 : Math.sin(worldTime * 4) * 0.02),
    [isMoving, worldTime],
  )

  return (
    <group
      position={[player.position[0], yOffset, player.position[2]]}
      rotation={[0, player.facing, 0]}
      scale={[0.92, 0.92, 0.92]}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.95, 20]} />
        <meshBasicMaterial color="#163148" transparent opacity={0.25} />
      </mesh>
      {characterMode === 'person' ? (
        <PersonModel />
      ) : (
        <SpeciesModel speciesId={species.id} palette={palette} />
      )}
    </group>
  )
}
