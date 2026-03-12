# Frankie’s Ducks and Birds House

Mobile-first isometric web game built with Vite, React, TypeScript, React Three Fiber, Drei, and Zustand.

## Gameplay

- Choose a `bird`, `duck`, or `goose`.
- Pick one of four preset color palettes for that species.
- Each round spawns either `5` or `10` eggs.
- Eggs hatch in numbered order after a short staggered timer.
- Every baby needs exactly `4` worms, and babies can be fed in any order.
- New nest zones unlock after rounds `2` and `4`.
- A waterfall opens on the far bank of the pond.

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

1. Download the marketplace assets manually from the URLs in `src/data/assetManifest.ts`.
2. Put each archive, extracted folder, or source file into `marketplace-downloads/` using the asset id as the filename or folder name.
3. Run `npm run assets:import`.
4. The script converts supported sources into runtime `.glb` files in `public/assets/models/` and updates `src/data/assetManifest.ts`.
5. The scene auto-switches from procedural stand-ins to `useGLTF` loaders whenever a manifest entry has a `runtimePath`.

Supported source formats:

- `.zip` archives containing `.glb`, `.gltf`, `.fbx`, or `.obj`
- extracted folders with one of those model formats inside
- direct `.glb`, `.gltf`, `.fbx`, or `.obj` files

Notes:

- `.gltf` conversion is handled by `gltf-pipeline`.
- `.fbx` and `.obj` conversion require the `blender` CLI to be installed.
- Imported meshes may still need manual pivot, rotation, or scale cleanup in Blender so they match the farm scene.
- Species palette recoloring works best when model material names include labels like `body`, `accent`, `beak`, `wing`, and `eye`.

## Notes

- The scene is client-only. There is no backend, save system, or multiplayer.
- Unit tests currently cover clutch spawning and zone unlock logic.
- Build output is chunk-split so the ThreeJS renderer ships separately from the UI shell.
