import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { useMemo } from 'react'
import { Box3, Color, Mesh, Vector3 } from 'three'
import type { Material, Object3D } from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ASSET_MANIFEST, ASSET_MANIFEST_BY_ID } from '../data/assetManifest'
import type { PaletteDefinition } from '../types/game'

type MarketplaceAssetProps = ThreeElements['group'] & {
  assetId: string
  palette?: PaletteDefinition
  sleepy?: boolean
}

interface LoadedMarketplaceAssetProps extends Omit<MarketplaceAssetProps, 'assetId'> {
  runtimePath: string
  assetId: string
}

interface MarketplaceAssetPreset {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

const shadowColor = '#34292a'

const ASSET_PRESETS: Record<string, MarketplaceAssetPreset> = {
  'bird-marketplace': {
    scale: 0.36,
  },
  'duck-marketplace': {
    scale: 4,
  },
  'goose-marketplace': {
    scale: 4,
  },
  'worm-marketplace': {
    scale: 0.013,
  },
  'pond-marketplace': {
    position: [0, 0.02, 0],
    scale: 0.01,
  },
}

const MATERIAL_TOKENS = {
  eye: ['eye'],
  beak: ['beak', 'bill', 'leg', 'legs', 'foot', 'feet', 'web'],
  wing: ['wing', 'tail'],
  accent: ['accent', 'head', 'crest', 'neck', 'mask', 'cheek'],
  body: ['body', 'feather', 'plumage', 'torso', 'base'],
} as const

const hasColorChannel = (material: Material): material is Material & { color: Color } =>
  'color' in material && material.color instanceof Color

const cloneMaterial = (material: Material | Material[]) =>
  Array.isArray(material) ? material.map((entry) => entry.clone()) : material.clone()

const resolvePaletteColor = (
  materialName: string,
  palette: PaletteDefinition,
  sleepy: boolean,
) => {
  const normalizedName = materialName.toLowerCase()

  if (MATERIAL_TOKENS.eye.some((token) => normalizedName.includes(token))) {
    return sleepy ? shadowColor : palette.colors.eye
  }

  if (MATERIAL_TOKENS.beak.some((token) => normalizedName.includes(token))) {
    return sleepy ? palette.colors.accent : palette.colors.beak
  }

  if (MATERIAL_TOKENS.wing.some((token) => normalizedName.includes(token))) {
    return palette.colors.wing
  }

  if (MATERIAL_TOKENS.accent.some((token) => normalizedName.includes(token))) {
    return palette.colors.accent
  }

  if (MATERIAL_TOKENS.body.some((token) => normalizedName.includes(token))) {
    return palette.colors.body
  }

  return null
}

const prepareScene = (
  root: Object3D,
  palette?: PaletteDefinition,
  sleepy = false,
) => {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return
    }

    child.castShadow = true
    child.receiveShadow = true

    if (!child.material) {
      return
    }

    child.material = cloneMaterial(child.material)

    if (!palette) {
      return
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material]

    materials.forEach((material) => {
      const nextColor = resolvePaletteColor(material.name, palette, sleepy)
      if (!nextColor || !hasColorChannel(material)) {
        return
      }

      material.color.set(nextColor)
    })
  })

  return root
}

const LoadedMarketplaceAsset = ({
  assetId,
  runtimePath,
  palette,
  sleepy = false,
  ...groupProps
}: LoadedMarketplaceAssetProps) => {
  const { scene } = useGLTF(runtimePath)
  const preset = ASSET_PRESETS[assetId] ?? {}
  const preparedAsset = useMemo(
    () => {
      const root = prepareScene(SkeletonUtils.clone(scene), palette, sleepy)
      const assetBounds = new Box3().setFromObject(root)
      const assetCenter = new Vector3()
      assetBounds.getCenter(assetCenter)

      return {
        object: root,
        normalizedPosition: [
          -assetCenter.x,
          -assetBounds.min.y,
          -assetCenter.z,
        ] as [number, number, number],
      }
    },
    [palette, scene, sleepy],
  )
  const presetPosition = preset.position ?? [0, 0, 0]

  return (
    <group {...groupProps}>
      <group
        position={presetPosition}
        rotation={preset.rotation}
        scale={preset.scale}
      >
        <group position={preparedAsset.normalizedPosition}>
          <primitive object={preparedAsset.object} />
        </group>
      </group>
    </group>
  )
}

export const MarketplaceAsset = ({
  assetId,
  palette,
  sleepy = false,
  ...groupProps
}: MarketplaceAssetProps) => {
  const asset = ASSET_MANIFEST_BY_ID[assetId]

  if (!asset?.runtimePath) {
    return null
  }

  return (
    <LoadedMarketplaceAsset
      assetId={assetId}
      runtimePath={asset.runtimePath}
      palette={palette}
      sleepy={sleepy}
      {...groupProps}
    />
  )
}

for (const asset of ASSET_MANIFEST) {
  if (asset.runtimePath) {
    useGLTF.preload(asset.runtimePath)
  }
}
