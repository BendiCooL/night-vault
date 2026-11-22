# Night Vault

![make.fun bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)
![rank](https://make.fun/badge/best-heist-game-20261122-0559/BendiCooL/night-vault/rank.svg)
![reward](https://make.fun/badge/best-heist-game-20261122-0559/BendiCooL/night-vault/reward.svg)

A tiny stealth heist game for the make.fun bounty
[Make the best heist game](https://make.fun/bounty/best-heist-game-20261122-0559).

You are the thief. Three rooms — a gallery, a counting house and the vault
itself — each one full of loot, patrolling guards with vision cones and
sweeping security cameras. Slip past the cones, take every piece of loot,
and reach the getaway door. Being seen fills the **ALARM** meter; a full
meter and the doors slam shut.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any
static file server). No network, no build step, no dependencies.

- **Move:** WASD or arrow keys
- **Toss a coin** to distract nearby guards: SPACE or mouse click (aim with
  the mouse — coins are limited per room, so spend them well)
- **Start / next room:** ENTER · **Retry a room after being caught:** R

## How it is built

Plain canvas 2D and ES modules under `game/src/`, one job per file:

- `levels.js` — the three rooms as data: walls, loot, patrols, cameras
- `guards.js` — waypoint patrols, pauses, coin distractions
- `cameras.js` — sweeping camera cones
- `detection.js` — who sees the thief, and how fast the alarm fills
- `render.js` — the room, the cones, the crew and the HUD
- `input.js` — keyboard and mouse
- `sound.js` — synthesised WebAudio blips (no audio files)
- `main.js` — the game loop and state

`main.ts` at the root is the hand-in program: it copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with
`buildDossier` from `vendor/makefun-game.ts` (the kit's library, unchanged).

## License

MIT — see `LICENSE`.
