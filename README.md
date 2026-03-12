# Duck-n-Bird-n-Goose
<img width="256" height="256" alt="dnbng" src="https://github.com/user-attachments/assets/b11596f8-41dc-499b-829d-5bcf8aad5c35" />

Vibe coded by a 6 year old. 
Mobile-first isometric built with Vite, React, TypeScript, React Three Fiber, Drei, and Zustand. 

## Gameplay
- Choose a `bird`, `duck`, or `goose`.
- Each round spawns some eggs.
- Eggs hatch in numbered order after a short staggered timer.
- Every baby needs exactly `4` worms, and babies can be fed in any order.
- New nest zones unlock after rounds `2` and `4`.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

## Notes

- The scene is client-only. There is no backend, save system, or multiplayer.
- Unit tests currently cover clutch spawning and zone unlock logic.
- Build output is chunk-split so the ThreeJS renderer ships separately from the UI shell.
- This is a WIP.
- Dad does the prompting
