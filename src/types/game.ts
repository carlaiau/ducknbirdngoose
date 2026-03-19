export type Vec3 = [number, number, number]

export type SpeciesId = 'bird' | 'duck' | 'goose'
export type CharacterMode = 'bird' | 'person'
export type PaletteId =
  | 'bird-dawn'
  | 'bird-lilac'
  | 'bird-berry'
  | 'bird-seafoam'
  | 'duck-classic'
  | 'duck-sunrise'
  | 'duck-pond'
  | 'duck-cloud'
  | 'goose-harvest'
  | 'goose-blush'
  | 'goose-river'
  | 'goose-moss'
export type ZoneId = 'yard' | 'reeds' | 'dock'
export type InputDirection = 'up' | 'right' | 'down' | 'left'
export type EggStage = 'egg' | 'baby'
export type ChickMode = 'follow' | 'patrol'
export type ChickHungerState = 'sated' | 'hungry'
export type SessionPhase = 'menu' | 'playing'
export type RoundPhase = 'playing' | 'round-clear'

export interface PaletteDefinition {
  id: PaletteId
  name: string
  colors: {
    body: string
    accent: string
    beak: string
    wing: string
    eye: string
  }
}

export interface SpeciesDefinition {
  id: SpeciesId
  name: string
  blurb: string
  assetId: string
  palettes: PaletteDefinition[]
}

export interface NestSpot {
  id: string
  zoneId: ZoneId
  position: Vec3
}

export interface WormPatchDefinition {
  id: string
  zoneId: ZoneId
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface EggState {
  id: string
  label: number
  zoneId: ZoneId
  position: Vec3
  hatchAt: number
  nextFeedAt: number
  wormsFed: number
  wormsNeeded: number
  stage: EggStage
}

export interface WormState {
  id: string
  zoneId: ZoneId
  position: Vec3
  wanderTarget: Vec3
  availableAt: number
  active: boolean
}

export interface ChickState {
  id: string
  label: number
  zoneId: ZoneId
  position: Vec3
  facing: number
  mode: ChickMode
  wanderTarget: Vec3
  hungerState: ChickHungerState
  hungerAt: number
  nextFeedAt: number
  wormsFed: number
  wormsNeeded: number
}

export interface PlayerInventory {
  worms: number
  capacity: number
  caughtBirds: number
}

export interface PlayerState {
  position: Vec3
  facing: number
}

export interface InputState {
  up: boolean
  right: boolean
  down: boolean
  left: boolean
}

export interface RoundState {
  number: number
  clutchSize: number
  unlockedZones: ZoneId[]
  phase: RoundPhase
  transitionAt: number | null
}

export interface AssetManifestEntry {
  id: string
  kind: 'species' | 'environment' | 'prop'
  sourceUrl: string
  author: string
  licenseName: string
  licenseUrl: string
  importedFileType: 'glb' | 'gltf' | 'none'
  runtimePath: string | null
  fallback: 'procedural'
  notes: string
}
