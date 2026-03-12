import { create } from 'zustand'
import { GAME_CONFIG } from '../config/gameConfig'
import { allBabiesFed, createClutch, createInitialWorms, getUnlockedZoneIds, inputToWorldVector, randomPointInUnlockedZones, randomPointInZone } from '../engine/gameLogic'
import { PALETTES_BY_ID, SPECIES, SPECIES_BY_ID } from '../data/species'
import type { EggState, FollowerState, InputDirection, InputState, PaletteId, PlayerInventory, PlayerState, RoundState, SessionPhase, SpeciesId, Vec3, WormState } from '../types/game'
import { angleFromVec2, clamp, distance2D, moveToward, normalize2D } from '../utils/math'

interface GameMetrics {
  totalBabiesFed: number
  totalWormsDelivered: number
}

interface GameStoreState {
  phase: SessionPhase
  selectedSpeciesId: SpeciesId
  selectedPaletteId: PaletteId
  cameraZoom: number
  round: RoundState
  worldTime: number
  eggs: EggState[]
  followers: FollowerState[]
  worms: WormState[]
  inventory: PlayerInventory
  player: PlayerState
  input: InputState
  metrics: GameMetrics
  selectSpecies: (speciesId: SpeciesId) => void
  selectPalette: (paletteId: PaletteId) => void
  adjustCameraZoom: (delta: number) => void
  setDirectionalInput: (direction: InputDirection, pressed: boolean) => void
  clearInput: () => void
  startSession: () => void
  resetSession: () => void
  advance: (delta: number) => void
}

const createRoundState = (number: number, clutchSize: number): RoundState => ({
  number,
  clutchSize,
  unlockedZones: getUnlockedZoneIds(number),
  phase: 'playing',
  transitionAt: null,
})

const createPlayer = (): PlayerState => ({
  position: [...GAME_CONFIG.playerSpawn] as Vec3,
  facing: -Math.PI / 4,
})

const createInventory = (): PlayerInventory => ({
  worms: 0,
  capacity: GAME_CONFIG.carryCapacity,
})

const createInput = (): InputState => ({
  up: false,
  right: false,
  down: false,
  left: false,
})

const createMetrics = (): GameMetrics => ({
  totalBabiesFed: 0,
  totalWormsDelivered: 0,
})

const createSessionState = () => {
  const roundNumber = 1
  const unlockedZones = getUnlockedZoneIds(roundNumber)
  const eggs = createClutch(roundNumber, 0)

  return {
    phase: 'playing' as const,
    worldTime: 0,
    cameraZoom: GAME_CONFIG.cameraZoom.default,
    round: createRoundState(roundNumber, eggs.length),
    eggs,
    followers: [],
    worms: createInitialWorms(unlockedZones),
    inventory: createInventory(),
    player: createPlayer(),
    input: createInput(),
    metrics: createMetrics(),
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  phase: 'menu',
  selectedSpeciesId: SPECIES[0].id,
  selectedPaletteId: SPECIES[0].palettes[0].id,
  cameraZoom: GAME_CONFIG.cameraZoom.default,
  round: createRoundState(1, 0),
  worldTime: 0,
  eggs: [],
  followers: [],
  worms: [],
  inventory: createInventory(),
  player: createPlayer(),
  input: createInput(),
  metrics: createMetrics(),
  selectSpecies: (speciesId) => {
    const species = SPECIES_BY_ID[speciesId]
    set({
      selectedSpeciesId: speciesId,
      selectedPaletteId: species.palettes[0].id,
    })
  },
  selectPalette: (paletteId) => {
    const selectedSpeciesId = get().selectedSpeciesId
    const species = SPECIES_BY_ID[selectedSpeciesId]
    if (species.palettes.some((palette) => palette.id === paletteId)) {
      set({ selectedPaletteId: paletteId })
    }
  },
  adjustCameraZoom: (delta) =>
    set((state) => ({
      cameraZoom: clamp(
        state.cameraZoom + delta,
        GAME_CONFIG.cameraZoom.min,
        GAME_CONFIG.cameraZoom.max,
      ),
    })),
  setDirectionalInput: (direction, pressed) =>
    set((state) => ({
      input: {
        ...state.input,
        [direction]: pressed,
      },
    })),
  clearInput: () => set({ input: createInput() }),
  startSession: () => {
    set(createSessionState())
  },
  resetSession: () => {
    const species = SPECIES_BY_ID[get().selectedSpeciesId]
    set({
      phase: 'menu',
      selectedPaletteId: species.palettes[0]?.id ?? get().selectedPaletteId,
      cameraZoom: GAME_CONFIG.cameraZoom.default,
      round: createRoundState(1, 0),
      worldTime: 0,
      eggs: [],
      followers: [],
      worms: [],
      inventory: createInventory(),
      player: createPlayer(),
      input: createInput(),
      metrics: createMetrics(),
    })
  },
  advance: (delta) =>
    set((state) => {
      if (state.phase !== 'playing') {
        return state
      }

      const nextWorldTime = state.worldTime + delta
      const movement = inputToWorldVector(state.input)
      const movedPosition: Vec3 = [
        clamp(
          state.player.position[0] + movement.x * GAME_CONFIG.playerSpeed * delta,
          GAME_CONFIG.mapBounds.minX,
          GAME_CONFIG.mapBounds.maxX,
        ),
        state.player.position[1],
        clamp(
          state.player.position[2] + movement.z * GAME_CONFIG.playerSpeed * delta,
          GAME_CONFIG.mapBounds.minZ,
          GAME_CONFIG.mapBounds.maxZ,
        ),
      ]

      const playerFacing =
        movement.x !== 0 || movement.z !== 0
          ? angleFromVec2(movement.x, movement.z)
          : state.player.facing

      let wormsInBag = state.inventory.worms
      let babiesFedCount = state.metrics.totalBabiesFed
      let wormsDelivered = state.metrics.totalWormsDelivered
      const unlockedZones = state.round.unlockedZones

      const worms = state.worms.map((worm) => {
        if (!worm.active) {
          if (nextWorldTime < worm.availableAt) {
            return worm
          }

          const spawn = randomPointInUnlockedZones(unlockedZones)

          return {
            ...worm,
            zoneId: spawn.zoneId,
            active: true,
            position: spawn.position,
            wanderTarget: spawn.wanderTarget,
          }
        }

        const dx = worm.wanderTarget[0] - worm.position[0]
        const dz = worm.wanderTarget[2] - worm.position[2]
        const distance = Math.hypot(dx, dz)
        const directionX = distance === 0 ? 0 : dx / distance
        const directionZ = distance === 0 ? 0 : dz / distance

        const nextX = moveToward(
          worm.position[0],
          worm.wanderTarget[0],
          GAME_CONFIG.wormSpeed * delta * Math.abs(directionX || 1),
        )
        const nextZ = moveToward(
          worm.position[2],
          worm.wanderTarget[2],
          GAME_CONFIG.wormSpeed * delta * Math.abs(directionZ || 1),
        )

        const nextPosition: Vec3 = [nextX, worm.position[1], nextZ]

        if (distance2D(movedPosition, nextPosition) <= GAME_CONFIG.collectRadius && wormsInBag < GAME_CONFIG.carryCapacity) {
          wormsInBag += 1
          return {
            ...worm,
            active: false,
            availableAt: nextWorldTime + GAME_CONFIG.wormRespawnDelay,
          }
        }

        const hasArrived = distance <= GAME_CONFIG.wormReach

        return {
          ...worm,
          position: nextPosition,
          wanderTarget: hasArrived ? randomPointInZone(worm.zoneId) : worm.wanderTarget,
        }
      })

      let closestBabyIndex = -1
      let closestBabyDistance = Number.POSITIVE_INFINITY

      for (const [index, egg] of state.eggs.entries()) {
        if (egg.stage !== 'baby' || egg.wormsFed >= egg.wormsNeeded) {
          continue
        }

        const distance = distance2D(movedPosition, egg.position)
        if (distance <= GAME_CONFIG.feedRadius && distance < closestBabyDistance) {
          closestBabyDistance = distance
          closestBabyIndex = index
        }
      }

      const newFollowers: FollowerState[] = []

      const eggs = state.eggs.flatMap((egg, index) => {
        const stage = egg.stage === 'egg' && nextWorldTime >= egg.hatchAt ? 'baby' : egg.stage

        if (
          index === closestBabyIndex &&
          stage === 'baby' &&
          wormsInBag > 0 &&
          nextWorldTime >= egg.nextFeedAt
        ) {
          const wormsFed = egg.wormsFed + 1
          wormsInBag -= 1
          wormsDelivered += 1

          if (wormsFed >= egg.wormsNeeded) {
            babiesFedCount += 1
            newFollowers.push({
              id: `${egg.id}-follower`,
              label: egg.label,
              position: [...egg.position] as Vec3,
              facing: playerFacing,
            })
            return []
          }

          return [
            {
              ...egg,
              stage,
              wormsFed,
              nextFeedAt: nextWorldTime + GAME_CONFIG.feedCooldown,
            },
          ]
        }

        return [
          {
            ...egg,
            stage,
          },
        ]
      })

      const followers = [...state.followers, ...newFollowers].reduce<FollowerState[]>(
        (accumulator, follower, index) => {
          const leaderPosition =
            index === 0 ? movedPosition : accumulator[index - 1].position
          const leaderFacing = index === 0 ? playerFacing : accumulator[index - 1].facing
          const dx = leaderPosition[0] - follower.position[0]
          const dz = leaderPosition[2] - follower.position[2]
          const distance = Math.hypot(dx, dz)
          const desiredGap = 1.05 + Math.min(index, 6) * 0.1
          const direction = normalize2D(dx, dz)
          const moveDistance =
            distance > desiredGap
              ? Math.min(distance - desiredGap, GAME_CONFIG.playerSpeed * 0.72 * delta)
              : 0
          const nextPosition: Vec3 = [
            follower.position[0] + direction.x * moveDistance,
            follower.position[1],
            follower.position[2] + direction.z * moveDistance,
          ]

          accumulator.push({
            ...follower,
            position: nextPosition,
            facing:
              moveDistance > 0.001 ? angleFromVec2(direction.x, direction.z) : leaderFacing,
          })

          return accumulator
        },
        [],
      )

      let round = state.round
      let nextEggs = eggs

      if (round.transitionAt !== null && nextWorldTime >= round.transitionAt) {
        const roundNumber = round.number + 1
        nextEggs = createClutch(roundNumber, nextWorldTime)
        round = createRoundState(roundNumber, nextEggs.length)
      } else if (round.transitionAt === null && allBabiesFed(eggs)) {
        round = {
          ...round,
          phase: 'round-clear',
          transitionAt: nextWorldTime + GAME_CONFIG.roundDelay,
        }
      }

      return {
        ...state,
        worldTime: nextWorldTime,
        round,
        eggs: nextEggs,
        followers,
        worms,
        inventory: {
          ...state.inventory,
          worms: wormsInBag,
        },
        player: {
          position: movedPosition,
          facing: playerFacing,
        },
        metrics: {
          totalBabiesFed: babiesFedCount,
          totalWormsDelivered: wormsDelivered,
        },
      }
    }),
}))

export const useSelectedSpecies = () =>
  SPECIES_BY_ID[useGameStore((state) => state.selectedSpeciesId)]

export const useSelectedPalette = () => PALETTES_BY_ID[useGameStore((state) => state.selectedPaletteId)]
