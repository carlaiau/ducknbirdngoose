import type { NestSpot, WormPatchDefinition } from '../types/game'

export const NEST_SPOTS: NestSpot[] = [
  { id: 'yard-1', zoneId: 'yard', position: [-11.8, 0.18, -4.3] },
  { id: 'yard-2', zoneId: 'yard', position: [-10.6, 0.18, -2.2] },
  { id: 'yard-3', zoneId: 'yard', position: [-9.2, 0.18, -0.6] },
  { id: 'yard-4', zoneId: 'yard', position: [-12.4, 0.18, 1.8] },
  { id: 'yard-5', zoneId: 'yard', position: [-11, 0.18, 3.3] },
  { id: 'yard-6', zoneId: 'yard', position: [-8.6, 0.18, 4.8] },
  { id: 'yard-7', zoneId: 'yard', position: [-7.4, 0.18, 1.2] },
  { id: 'yard-8', zoneId: 'yard', position: [-7.9, 0.18, -2.8] },
  { id: 'yard-9', zoneId: 'yard', position: [-5.9, 0.18, -4.9] },
  { id: 'yard-10', zoneId: 'yard', position: [-5.2, 0.18, 3.8] },
  { id: 'reeds-1', zoneId: 'reeds', position: [-1.8, 0.18, -5.7] },
  { id: 'reeds-2', zoneId: 'reeds', position: [0.8, 0.18, -3.6] },
  { id: 'reeds-3', zoneId: 'reeds', position: [1.6, 0.18, -0.8] },
  { id: 'reeds-4', zoneId: 'reeds', position: [0.6, 0.18, 2.2] },
  { id: 'reeds-5', zoneId: 'reeds', position: [-1.4, 0.18, 4.6] },
  { id: 'reeds-6', zoneId: 'reeds', position: [2.4, 0.18, 4.8] },
  { id: 'dock-1', zoneId: 'dock', position: [7.4, 0.18, -5.2] },
  { id: 'dock-2', zoneId: 'dock', position: [9.6, 0.18, -2.3] },
  { id: 'dock-3', zoneId: 'dock', position: [11.3, 0.18, 0.9] },
  { id: 'dock-4', zoneId: 'dock', position: [12.4, 0.18, 3.8] },
  { id: 'dock-5', zoneId: 'dock', position: [8.5, 0.18, 5.6] },
  { id: 'dock-6', zoneId: 'dock', position: [6.2, 0.18, 2.8] },
]

export const WORM_PATCHES: WormPatchDefinition[] = [
  { id: 'yard-north', zoneId: 'yard', minX: -14.2, maxX: -5.4, minZ: -7.2, maxZ: -3.6 },
  { id: 'yard-south', zoneId: 'yard', minX: -13.6, maxX: -4.8, minZ: 2.6, maxZ: 7.2 },
  { id: 'yard-middle', zoneId: 'yard', minX: -13.2, maxX: -5.6, minZ: -1.8, maxZ: 1.8 },
  { id: 'reeds-west', zoneId: 'reeds', minX: -2.6, maxX: 3.2, minZ: -7, maxZ: -3.2 },
  { id: 'reeds-east', zoneId: 'reeds', minX: -2.4, maxX: 3.4, minZ: 2.6, maxZ: 7.1 },
  { id: 'dock-west', zoneId: 'dock', minX: 5.8, maxX: 13.8, minZ: -7.1, maxZ: -2.2 },
  { id: 'dock-east', zoneId: 'dock', minX: 5.6, maxX: 14.2, minZ: 2.4, maxZ: 7.3 },
]
