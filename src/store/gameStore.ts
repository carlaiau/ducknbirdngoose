import { create } from 'zustand'
import { GAME_CONFIG } from '../config/gameConfig'
import {
  createClutch,
  createInitialWorms,
  createPatrolChickFromEgg,
  getUnlockedZoneIds,
  hasPendingPersonGoals,
  hasPendingRoundGoals,
  inputToWorldVector,
  pickPatrolHungerDelay,
  randomPointInUnlockedZones,
  randomPointInZone,
} from '../engine/gameLogic'
import { PALETTES_BY_ID, SPECIES, SPECIES_BY_ID } from '../data/species'
import type {
  CharacterMode,
  ChickState,
  EggState,
  InputDirection,
  InputState,
  PaletteId,
  PlayerInventory,
  PlayerState,
  RoundState,
  SessionPhase,
  SpeciesId,
  Vec3,
  WormState,
} from '../types/game'
import { ALL_OBSTACLES } from '../data/obstacles'
import { angleFromVec2, clamp, distance2D, moveToward, normalize2D, resolveObstacles } from '../utils/math'

interface GameMetrics {
  totalBabiesFed: number
  totalWormsDelivered: number
}

interface GameStoreState {
  phase: SessionPhase
  characterMode: CharacterMode
  selectedSpeciesId: SpeciesId
  selectedPaletteId: PaletteId
  cameraZoom: number
  round: RoundState
  worldTime: number
  eggs: EggState[]
  chicks: ChickState[]
  worms: WormState[]
  inventory: PlayerInventory
  player: PlayerState
  moveTarget: Vec3 | null
  input: InputState
  metrics: GameMetrics
  selectCharacterMode: (mode: CharacterMode) => void
  selectSpecies: (speciesId: SpeciesId) => void
  selectPalette: (paletteId: PaletteId) => void
  adjustCameraZoom: (delta: number) => void
  setMoveTarget: (target: Vec3 | null) => void
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
  caughtBirds: 0,
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

const getNextChickLabel = (eggs: EggState[], chicks: ChickState[]) =>
  Math.max(0, ...eggs.map((egg) => egg.label), ...chicks.map((chick) => chick.label)) + 1

const createSessionState = () => {
  const roundNumber = 1
  const unlockedZones = getUnlockedZoneIds(roundNumber)
  const eggs = createClutch(roundNumber, 0, 1)

  return {
    phase: 'playing' as const,
    worldTime: 0,
    cameraZoom: GAME_CONFIG.cameraZoom.default,
    round: createRoundState(roundNumber, eggs.length),
    eggs,
    chicks: [],
    worms: createInitialWorms(unlockedZones),
    inventory: createInventory(),
    player: createPlayer(),
    moveTarget: null,
    input: createInput(),
    metrics: createMetrics(),
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  phase: 'menu',
  characterMode: 'bird',
  selectedSpeciesId: SPECIES[0].id,
  selectedPaletteId: SPECIES[0].palettes[0].id,
  cameraZoom: GAME_CONFIG.cameraZoom.default,
  round: createRoundState(1, 0),
  worldTime: 0,
  eggs: [],
  chicks: [],
  worms: [],
  inventory: createInventory(),
  player: createPlayer(),
  moveTarget: null,
  input: createInput(),
  metrics: createMetrics(),
  selectCharacterMode: (mode) => set({ characterMode: mode }),
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
  setMoveTarget: (target) =>
    set(() => ({
      moveTarget:
        target === null
          ? null
          : [
              clamp(target[0], GAME_CONFIG.mapBounds.minX, GAME_CONFIG.mapBounds.maxX),
              target[1],
              clamp(target[2], GAME_CONFIG.mapBounds.minZ, GAME_CONFIG.mapBounds.maxZ),
            ],
      input: createInput(),
    })),
  setDirectionalInput: (direction, pressed) =>
    set((state) => ({
      moveTarget: pressed ? null : state.moveTarget,
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
      chicks: [],
      worms: [],
      inventory: createInventory(),
      player: createPlayer(),
      moveTarget: null,
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
      const hasDirectionalInput = movement.x !== 0 || movement.z !== 0
      const targetDeltaX = hasDirectionalInput || state.moveTarget === null
        ? 0
        : state.moveTarget[0] - state.player.position[0]
      const targetDeltaZ = hasDirectionalInput || state.moveTarget === null
        ? 0
        : state.moveTarget[2] - state.player.position[2]
      const targetDistance = Math.hypot(targetDeltaX, targetDeltaZ)
      const targetMovement =
        targetDistance > 0.001 ? normalize2D(targetDeltaX, targetDeltaZ) : { x: 0, z: 0 }
      const activeMovement = hasDirectionalInput ? movement : targetMovement
      const movementStep = GAME_CONFIG.playerSpeed * delta
      const nextX = hasDirectionalInput
        ? state.player.position[0] + activeMovement.x * movementStep
        : state.moveTarget === null
          ? state.player.position[0]
          : moveToward(state.player.position[0], state.moveTarget[0], movementStep * Math.abs(activeMovement.x || 1))
      const nextZ = hasDirectionalInput
        ? state.player.position[2] + activeMovement.z * movementStep
        : state.moveTarget === null
          ? state.player.position[2]
          : moveToward(state.player.position[2], state.moveTarget[2], movementStep * Math.abs(activeMovement.z || 1))
      const clampedPosition: Vec3 = [
        clamp(nextX, GAME_CONFIG.mapBounds.minX, GAME_CONFIG.mapBounds.maxX),
        state.player.position[1],
        clamp(nextZ, GAME_CONFIG.mapBounds.minZ, GAME_CONFIG.mapBounds.maxZ),
      ]
      const resolved = resolveObstacles(clampedPosition, ALL_OBSTACLES)
      const movedPosition: Vec3 = [
        clamp(resolved[0], GAME_CONFIG.mapBounds.minX, GAME_CONFIG.mapBounds.maxX),
        resolved[1],
        clamp(resolved[2], GAME_CONFIG.mapBounds.minZ, GAME_CONFIG.mapBounds.maxZ),
      ]
      const hasMoveTarget =
        !hasDirectionalInput &&
        state.moveTarget !== null &&
        distance2D(movedPosition, state.moveTarget) > 0.18

      const playerFacing =
        activeMovement.x !== 0 || activeMovement.z !== 0
          ? angleFromVec2(activeMovement.x, activeMovement.z)
          : state.player.facing

      const isPersonMode = state.characterMode === 'person'
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
        const direction = normalize2D(dx, dz)

        const nextX = moveToward(
          worm.position[0],
          worm.wanderTarget[0],
          GAME_CONFIG.wormSpeed * delta * Math.abs(direction.x || 1),
        )
        const nextZ = moveToward(
          worm.position[2],
          worm.wanderTarget[2],
          GAME_CONFIG.wormSpeed * delta * Math.abs(direction.z || 1),
        )

        const nextPosition: Vec3 = [nextX, worm.position[1], nextZ]

        if (!isPersonMode && distance2D(movedPosition, nextPosition) <= GAME_CONFIG.collectRadius && wormsInBag < GAME_CONFIG.carryCapacity) {
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

      const chicksBeforeFeed = state.chicks.map((chick) => {
        if (chick.mode !== 'patrol') {
          return chick
        }

        const isHungry =
          state.round.phase === 'playing' &&
          chick.hungerState === 'sated' &&
          nextWorldTime >= chick.hungerAt

        if (isHungry) {
          return {
            ...chick,
            hungerState: 'hungry' as const,
            wormsFed: 0,
            nextFeedAt: 0,
          }
        }

        if (chick.hungerState === 'hungry') {
          return chick
        }

        const dx = chick.wanderTarget[0] - chick.position[0]
        const dz = chick.wanderTarget[2] - chick.position[2]
        const distance = Math.hypot(dx, dz)
        const direction = normalize2D(dx, dz)
        const moveDistance = Math.min(distance, GAME_CONFIG.flockPatrolSpeed * delta)
        const nextPosition: Vec3 = [
          chick.position[0] + direction.x * moveDistance,
          chick.position[1],
          chick.position[2] + direction.z * moveDistance,
        ]

        return {
          ...chick,
          position: nextPosition,
          facing:
            moveDistance > 0.001 ? angleFromVec2(direction.x, direction.z) : chick.facing,
          wanderTarget:
            distance <= GAME_CONFIG.patrolReach
              ? randomPointInZone(chick.zoneId)
              : chick.wanderTarget,
        }
      })

      const newChicks: ChickState[] = []
      let eggs: EggState[]
      let chicksAfterFeed: ChickState[]

      if (isPersonMode) {
        // Person mode: eggs auto-feed on a timer, no player involvement
        eggs = state.eggs.flatMap((egg:any) => {
          const stage = egg.stage === 'egg' && nextWorldTime >= egg.hatchAt ? 'baby' : egg.stage
          if (stage !== 'baby') return [{ ...egg, stage }]

          let { nextFeedAt, wormsFed } = egg
          if (nextFeedAt === 0) {
            // First frame as baby: set the initial feed timer
            nextFeedAt = nextWorldTime + GAME_CONFIG.personAutoFeedInterval
          } else if (nextWorldTime >= nextFeedAt) {
            wormsFed += 1
            nextFeedAt = nextWorldTime + GAME_CONFIG.personAutoFeedInterval
          }

          if (wormsFed >= egg.wormsNeeded) {
            babiesFedCount += 1
            newChicks.push(createPatrolChickFromEgg({ ...egg, stage, wormsFed }, nextWorldTime))
            return []
          }

          return [{ ...egg, stage, wormsFed, nextFeedAt }]
        })
        chicksAfterFeed = chicksBeforeFeed
      } else {
        // Bird mode: player collects worms and feeds eggs/chicks
        let closestTarget:
          | { kind: 'egg'; id: string; distance: number }
          | { kind: 'chick'; id: string; distance: number }
          | null = null

        for (const egg of state.eggs) {
          const stage = egg.stage === 'egg' && nextWorldTime >= egg.hatchAt ? 'baby' : egg.stage
          if (stage !== 'baby' || egg.wormsFed >= egg.wormsNeeded) continue
          const distance = distance2D(movedPosition, egg.position)
          if (distance <= GAME_CONFIG.feedRadius && (closestTarget === null || distance < closestTarget.distance)) {
            closestTarget = { kind: 'egg', id: egg.id, distance }
          }
        }

        for (const chick of chicksBeforeFeed) {
          if (chick.mode !== 'patrol' || chick.hungerState !== 'hungry' || chick.wormsFed >= chick.wormsNeeded) continue
          const distance = distance2D(movedPosition, chick.position)
          if (distance <= GAME_CONFIG.feedRadius && (closestTarget === null || distance < closestTarget.distance)) {
            closestTarget = { kind: 'chick', id: chick.id, distance }
          }
        }

        eggs = state.eggs.flatMap((egg) => {
          const stage = egg.stage === 'egg' && nextWorldTime >= egg.hatchAt ? 'baby' : egg.stage

          if (
            closestTarget?.kind === 'egg' &&
            closestTarget.id === egg.id &&
            stage === 'baby' &&
            wormsInBag > 0 &&
            nextWorldTime >= egg.nextFeedAt
          ) {
            const wormsFed = egg.wormsFed + 1
            wormsInBag -= 1
            wormsDelivered += 1

            if (wormsFed >= egg.wormsNeeded) {
              babiesFedCount += 1
              newChicks.push(createPatrolChickFromEgg({ ...egg, stage, wormsFed }, nextWorldTime))
              return []
            }

            return [{ ...egg, stage, wormsFed, nextFeedAt: nextWorldTime + GAME_CONFIG.feedCooldown }]
          }

          return [{ ...egg, stage }]
        })

        chicksAfterFeed = chicksBeforeFeed.map((chick) => {
          if (
            closestTarget?.kind !== 'chick' ||
            closestTarget.id !== chick.id ||
            chick.mode !== 'patrol' ||
            chick.hungerState !== 'hungry' ||
            wormsInBag <= 0 ||
            nextWorldTime < chick.nextFeedAt
          ) {
            return chick
          }

          const wormsFed = chick.wormsFed + 1
          wormsInBag -= 1
          wormsDelivered += 1

          if (wormsFed >= chick.wormsNeeded) {
            babiesFedCount += 1
            return {
              ...chick,
              hungerState: 'sated' as const,
              hungerAt: nextWorldTime + pickPatrolHungerDelay(),
              nextFeedAt: 0,
              wormsFed: 0,
              wanderTarget: randomPointInZone(chick.zoneId),
            }
          }

          return { ...chick, wormsFed, nextFeedAt: nextWorldTime + GAME_CONFIG.feedCooldown }
        })
      }

      const patrolChicks = [...chicksAfterFeed.filter((chick) => chick.mode === 'patrol'), ...newChicks]

      let round = state.round
      let nextEggs = eggs
      let nextChicks = patrolChicks

      // Person mode: catch patrol chicks that are within cage range
      let caughtBirdsCount = state.inventory.caughtBirds
      if (isPersonMode) {
        nextChicks = nextChicks.filter((chick) => {
          if (chick.mode !== 'patrol') return true
          if (distance2D(movedPosition, chick.position) <= GAME_CONFIG.cageRadius) {
            caughtBirdsCount += 1
            return false
          }
          return true
        })
      }

      if (round.transitionAt !== null && nextWorldTime >= round.transitionAt) {
        const roundNumber = round.number + 1
        nextEggs = createClutch(roundNumber, nextWorldTime, getNextChickLabel(nextEggs, nextChicks))
        round = createRoundState(roundNumber, nextEggs.length)
        caughtBirdsCount = 0 // reset per-round count for person mode
      } else if (round.transitionAt === null) {
        const pending = isPersonMode
          ? hasPendingPersonGoals(nextEggs, nextChicks)
          : hasPendingRoundGoals(nextEggs, nextChicks)
        if (!pending) {
          round = {
            ...round,
            phase: 'round-clear',
            transitionAt: nextWorldTime + GAME_CONFIG.roundDelay,
          }
        }
      }

      return {
        ...state,
        worldTime: nextWorldTime,
        round,
        eggs: nextEggs,
        chicks: nextChicks,
        worms,
        inventory: {
          ...state.inventory,
          worms: isPersonMode ? 0 : wormsInBag,
          caughtBirds: caughtBirdsCount,
        },
        player: {
          position: movedPosition,
          facing: playerFacing,
        },
        moveTarget: hasMoveTarget ? state.moveTarget : null,
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
