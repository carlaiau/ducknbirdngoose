# Frankie’s Ducks and Birds House

Mobile-first isometric web game built with Vite, React, TypeScript, React Three Fiber, Drei, and Zustand.

## Gameplay

- Choose a `bird`, `duck`, or `goose`.
- Pick one of four preset color palettes for that species.
- Each round spawns either `5` or `10` eggs.
- Eggs hatch in numbered order after a short staggered timer.
- Every baby needs exactly `4` worms, and babies can be fed in any order.
- New nest zones unlock after rounds `2` and `4`.
- A waterfall slot is reserved on the far bank of the pond.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

## Marketplace Asset Pipeline

The current runtime uses procedural stand-ins so the game works out of the box. The asset manifest already points at the requested Sketchfab listings, including the waterfall model.

When you have the marketplace downloads locally:

1. Download and convert the selected models to optimized `.glb` files.
2. Drop them into `public/assets/models/`.
3. Update `src/data/assetManifest.ts` with the runtime paths.
4. Swap the procedural stand-ins for `useGLTF` loaders where needed.

## Notes

- The scene is client-only. There is no backend, save system, or multiplayer.
- Unit tests currently cover clutch spawning and zone unlock logic.
- Build output is chunk-split so the ThreeJS renderer ships separately from the UI shell.
