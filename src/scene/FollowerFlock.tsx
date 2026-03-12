import { useGameStore, useSelectedPalette } from '../store/gameStore'
import { useSelectedSpecies } from '../store/gameStore'
import { SpeciesModel } from './SpeciesModel'

export const FollowerFlock = () => {
  const followers = useGameStore((state) => state.followers)
  const worldTime = useGameStore((state) => state.worldTime)
  const species = useSelectedSpecies()
  const palette = useSelectedPalette()

  return (
    <>
      {followers.map((follower, index) => {
        const bob = Math.sin(worldTime * 5 + index * 0.8) * 0.04

        return (
          <group
            key={follower.id}
            position={[follower.position[0], 0.16 + bob, follower.position[2]]}
            rotation={[0, follower.facing, 0]}
            scale={[0.72, 0.72, 0.72]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
              <circleGeometry args={[0.48, 18]} />
              <meshBasicMaterial color="#163148" transparent opacity={0.18} />
            </mesh>
            <SpeciesModel speciesId={species.id} palette={palette} variant="baby" />
          </group>
        )
      })}
    </>
  )
}
