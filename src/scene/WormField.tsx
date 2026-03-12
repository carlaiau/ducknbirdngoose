import { ASSET_MANIFEST_BY_ID } from '../data/assetManifest'
import { useGameStore } from '../store/gameStore'
import { MarketplaceAsset } from './MarketplaceAsset'

export const WormField = () => {
  const worms = useGameStore((state) => state.worms)
  const worldTime = useGameStore((state) => state.worldTime)
  const hasMarketplaceWorm = Boolean(ASSET_MANIFEST_BY_ID['worm-marketplace']?.runtimePath)

  return (
    <>
      {worms
        .filter((worm) => worm.active)
        .map((worm, index) => {
          const phase = worldTime * 8 + index
          return (
            <group key={worm.id} position={worm.position} rotation={[0, phase * 0.08, 0]}>
              {hasMarketplaceWorm ? (
                <MarketplaceAsset assetId="worm-marketplace" />
              ) : (
                <>
                  <mesh castShadow position={[-0.12, 0, 0]}>
                    <sphereGeometry args={[0.12, 6, 6]} />
                    <meshStandardMaterial color="#cc6d4e" flatShading />
                  </mesh>
                  <mesh castShadow position={[0.04, Math.sin(phase) * 0.03, 0]}>
                    <sphereGeometry args={[0.11, 6, 6]} />
                    <meshStandardMaterial color="#d97c5b" flatShading />
                  </mesh>
                  <mesh castShadow position={[0.2, Math.sin(phase + 0.4) * 0.04, 0]}>
                    <sphereGeometry args={[0.09, 6, 6]} />
                    <meshStandardMaterial color="#e88a66" flatShading />
                  </mesh>
                </>
              )}
            </group>
          )
        })}
    </>
  )
}
