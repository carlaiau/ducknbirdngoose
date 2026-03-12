import { Html } from '@react-three/drei'
import { useGameStore, useSelectedPalette } from '../store/gameStore'
import { useSelectedSpecies } from '../store/gameStore'
import { EggModel } from './EggModel'
import { SpeciesModel } from './SpeciesModel'

export const NestCluster = () => {
  const eggs = useGameStore((state) => state.eggs)
  const species = useSelectedSpecies()
  const palette = useSelectedPalette()
  const worldTime = useGameStore((state) => state.worldTime)

  return (
    <>
      {eggs.map((egg) => {
        const wiggle = egg.stage === 'egg' ? Math.sin(worldTime * 7 + egg.label) * 0.035 : 0

        return (
          <group key={egg.id} position={egg.position}>
            <mesh receiveShadow position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.72, 0.18, 6, 14]} />
              <meshStandardMaterial color="#8d6a44" flatShading />
            </mesh>

            {egg.stage === 'egg' ? (
              <group position={[0, 0.7 + wiggle, 0]}>
                <EggModel />
              </group>
            ) : (
              <group position={[0, 0.18, 0]}>
                <SpeciesModel
                  speciesId={species.id}
                  palette={palette}
                  variant="baby"
                />
              </group>
            )}

            {egg.stage !== 'egg' ? (
              <group position={[0, 0.22, 0]}>
                {Array.from({ length: egg.wormsNeeded }, (_, index) => {
                  const angle = (Math.PI * 2 * index) / egg.wormsNeeded
                  return (
                    <mesh
                      key={`${egg.id}-pip-${index + 1}`}
                      position={[Math.cos(angle) * 0.44, 0.12, Math.sin(angle) * 0.44]}
                    >
                      <sphereGeometry args={[0.08, 8, 8]} />
                      <meshStandardMaterial
                        color={index < egg.wormsFed ? '#ffbc58' : '#31495f'}
                        flatShading
                      />
                    </mesh>
                  )
                })}
              </group>
            ) : null}

            <Html position={[0, egg.stage === 'egg' ? 1.7 : 1.95, 0]} center>
              <div className="egg-badge">{egg.label}</div>
            </Html>
          </group>
        )
      })}
    </>
  )
}
