export interface ObstacleCircle {
  x: number
  z: number
  radius: number
}

// Placed GLB houses — radii match max(width, depth) / 2 of each model
export const HOUSE_OBSTACLES: ObstacleCircle[] = [
  { x: -14.5, z: -10.5, radius: 2.8 }, // house 1  (3.24 × 5.71)
  { x:   4.5, z: -12.0, radius: 2.4 }, // house 2  (3.69 × 4.95)
  { x:  10.0, z: -11.5, radius: 1.3 }, // house 3  (2.64 × 2.58)
  { x: -18.5, z:  -8.0, radius: 2.4 }, // house 4  (2.93 × 4.97)
  { x: -18.0, z:   9.5, radius: 2.6 }, // house 5  (3.69 × 5.24)
  { x:   5.5, z:  11.0, radius: 2.8 }, // house 1  (second instance)
  { x:  16.5, z: -10.0, radius: 2.4 }, // house 2  (second instance)
  { x:  17.0, z:   9.5, radius: 1.3 }, // house 3  (second instance)
]

// Obstacle trees — inside or near the playable area so they actually matter
// (border-forest trees beyond ±17 are mostly decorative and not listed here)
export const TREE_OBSTACLES: ObstacleCircle[] = [
  // Inland clusters added for visual depth
  { x: -14.5, z: -11.0, radius: 1.0 },
  { x: -12.0, z: -13.0, radius: 1.0 },
  { x:  12.0, z: -13.0, radius: 1.0 },
  { x:  15.0, z: -11.0, radius: 1.0 },
  { x: -13.5, z:  12.0, radius: 1.0 },
  { x:  12.5, z:  13.0, radius: 1.0 },
  // Second-row trees near play boundaries
  { x: -17.0, z:  -7.0, radius: 1.0 },
  { x: -16.0, z:   8.0, radius: 1.0 },
  { x:  16.0, z:  -8.0, radius: 1.0 },
  { x:  17.5, z:   6.0, radius: 1.0 },
  { x: -18.0, z:  -2.5, radius: 1.0 },
  { x: -17.5, z:   3.5, radius: 1.0 },
  { x:  17.5, z:  -3.5, radius: 1.0 },
  { x:  16.5, z:   2.0, radius: 1.0 },
  // Scattered obstacle trees inside the play zone
  { x:  -5.0, z:  -2.0, radius: 1.0 },
  { x:   6.0, z:   0.0, radius: 1.0 },
  { x:  -6.0, z:   9.0, radius: 1.0 },
  { x:   5.0, z:  -9.0, radius: 1.0 },
  { x: -16.0, z: -10.0, radius: 1.0 },
  { x:  16.0, z:   0.0, radius: 1.0 },
]

// House centre positions used for homed-bird wandering (y = ground level)
export const HOME_POSITIONS: Array<[number, number, number]> = [
  [-14.5, 0.16, -10.5],  // house 1
  [4.5,   0.16, -12.0],  // house 2
  [10.0,  0.16, -11.5],  // house 3
  [-18.5, 0.16,  -8.0],  // house 4
  [-18.0, 0.16,   9.5],  // house 5
  [5.5,   0.16,  11.0],  // house 1 (second)
  [16.5,  0.16, -10.0],  // house 2 (second)
  [17.0,  0.16,   9.5],  // house 3 (second)
]

export const ALL_OBSTACLES: ReadonlyArray<ObstacleCircle> = [
  ...HOUSE_OBSTACLES,
  ...TREE_OBSTACLES,
]
