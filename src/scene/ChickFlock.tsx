import { Html } from '@react-three/drei'
import { useGameStore, useSelectedPalette } from '../store/gameStore'
import { useSelectedSpecies } from '../store/gameStore'
import { SpeciesModel } from './SpeciesModel'

export const ChickFlock = () => {
  const chicks = useGameStore((state) => state.chicks)
  const worldTime = useGameStore((state) => state.worldTime)
  const species = useSelectedSpecies()
  const palette = useSelectedPalette()

  return (
    <>
      {chicks.map((chick, index) => {
        const isHungryPatrol = chick.mode === 'patrol' && chick.hungerState === 'hungry'
        const bob =
          chick.mode === 'follow'
            ? Math.sin(worldTime * 5 + index * 0.8) * 0.04
            : Math.sin(worldTime * 3.2 + index * 0.7) * 0.02

        return (
          <group
            key={chick.id}
            position={[chick.position[0], 0.16 + bob, chick.position[2]]}
            rotation={[0, chick.facing, 0]}
            scale={chick.mode === 'follow' ? [0.68, 0.68, 0.68] : [0.62, 0.62, 0.62]}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
              <circleGeometry args={[0.42, 18]} />
              <meshBasicMaterial color="#163148" transparent opacity={0.18} />
            </mesh>

            <SpeciesModel speciesId={species.id} palette={palette} variant="baby" />

            {isHungryPatrol ? (
              <>
                <group position={[0, 0.22, 0]}>
                  {Array.from({ length: chick.wormsNeeded }, (_, pipIndex) => {
                    const angle = (Math.PI * 2 * pipIndex) / chick.wormsNeeded
                    return (
                      <mesh
                        key={`${chick.id}-pip-${pipIndex + 1}`}
                        position={[Math.cos(angle) * 0.44, 0.12, Math.sin(angle) * 0.44]}
                      >
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshStandardMaterial
                          color={pipIndex < chick.wormsFed ? '#ffbc58' : '#31495f'}
                          flatShading
                        />
                      </mesh>
                    )
                  })}
                </group>

                <Html position={[0, 2.05, 0]} center>
                  <div className="egg-badge">{chick.label}</div>
                </Html>
              </>
            ) : null}
          </group>
        )
      })}
    </>
  )
}
