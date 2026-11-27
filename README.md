# Gobble Dash — A Thanksgiving Breakout

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/sage-otter-44/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/sage-otter-44/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Giblet the turkey is on the menu tonight. Run the farmyard, sneak through the
barn, dodge the oven — and reach the back door before Farmer Bram catches you.

## How to play

Open `game/index.html` in a desktop browser (or `node serve.ts` and visit
http://localhost:8080). No build step, no network requests, everything is
static files under `game/`.

- **← → / A D** — run
- **↑ / SPACE** — jump (press again mid-air to flap)
- **SHIFT** — sprint (outrun the farmer, briefly)
- **H** — hide in a haystack while the farmer searches
- **M** — mute, **P** — pause, **R** — restart

Three stages, one escape: the farmyard (fences, rolling pumpkins), the barn
(swinging carving knives, haystacks to hide in), the kitchen (bursting ovens,
falling knives, steam jets). Grab corn for points, golden feathers for an
extra life. Reach the back door to escape — get caught and it is Thanksgiving
dinner for you.

## Layout

- `main.ts` — the hand-in program (Node 22 stdlib only): copies `game/` and
  `screenshots/` to `/output` and writes `dossier.json` via
  `vendor/makefun-game.ts`.
- `game/` — the playable game: `index.html` plus one module per job under
  `src/` (config, input, audio, turkey, farmer, hazards, stages, render,
  game, shots).
- `screenshots/` — 4 real renders of the game itself (cover first).
- `vendor/makefun-game.ts` — make.fun's dossier library, copied unchanged.

## Screenshots

1. `1-play.jpg` — mid-chase in the farmyard, farmer closing in.
2. `2-kitchen.jpg` — the kitchen: oven bursting, knife falling.
3. `3-title.jpg` — title screen.
4. `4-escaped.jpg` — the escape (end screen).
