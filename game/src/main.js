// main.js — Night Vault's game loop and state. Modes: title, playing,
// caught, clear, win. Owns the thief, the coin tosses, loot pickup and
// level changes; sight and alarm maths live in detection.js, patrols in
// guards.js, camera sweeps in cameras.js.

import { LEVELS, LOOT_VALUES } from './levels.js';
import { circleHitsWall, distance, slideMove } from './geometry.js';
import { createGuard, distractGuard, updateGuard } from './guards.js';
import { createCamera, updateCamera } from './cameras.js';
import { updateDetection } from './detection.js';
import { attachInput, mouse, moveVector, takePress } from './input.js';
import { drawScene } from './render.js';
import { sfx } from './sound.js';

const PLAYER_RADIUS = 13;
const PLAYER_SPEED = 178;
const COIN_RANGE = 240;
const COIN_DISTRACT_RADIUS = 190;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function freshLevel(index) {
  const level = LEVELS[index];
  return {
    mode: index === 0 ? 'title' : 'playing',
    levelIndex: index,
    player: { x: level.playerStart.x, y: level.playerStart.y, facing: 0, sackSize: 0 },
    guards: level.guards.map(createGuard),
    cameras: level.cameras.map(createCamera),
    lootTaken: level.loot.map(() => false),
    alarm: 0,
    seenBy: null,
    coinsLeft: level.coins,
    coinPings: [],
    haul: 0,
    elapsed: 0,
    alarmTickAt: 0,
  };
}

let state = freshLevel(0);
state.haul = 0;
let totalHaul = 0;
let haulAtLevelStart = 0;

function startRun() {
  totalHaul = 0;
  haulAtLevelStart = 0;
  state = freshLevel(0);
  state.mode = 'playing';
}

function nextLevel() {
  const next = state.levelIndex + 1;
  if (next >= LEVELS.length) {
    state.mode = 'win';
    return;
  }
  state = freshLevel(next);
  state.mode = 'playing';
  haulAtLevelStart = totalHaul;
}

function tossCoin(now) {
  if (state.coinsLeft <= 0) return;
  const px = state.player.x;
  const py = state.player.y;
  let tx = mouse.x || px + Math.cos(state.player.facing) * 120;
  let ty = mouse.y || py + Math.sin(state.player.facing) * 120;
  const d = distance(px, py, tx, ty);
  if (d > COIN_RANGE) {
    tx = px + ((tx - px) / d) * COIN_RANGE;
    ty = py + ((ty - py) / d) * COIN_RANGE;
  }
  state.coinsLeft -= 1;
  state.coinPings.push({ x: tx, y: ty, at: now });
  for (const guard of state.guards) {
    distractGuard(guard, tx, ty, now, COIN_DISTRACT_RADIUS);
  }
  sfx.coin();
}

function updatePlaying(dt, now) {
  const level = LEVELS[state.levelIndex];
  state.elapsed += dt;

  const move = moveVector();
  if (move.x !== 0 || move.y !== 0) {
    state.player.facing = Math.atan2(move.y, move.x);
    const moved = slideMove(
      state.player.x, state.player.y, PLAYER_RADIUS,
      move.x * PLAYER_SPEED * dt, move.y * PLAYER_SPEED * dt, level.walls,
    );
    state.player.x = moved.x;
    state.player.y = moved.y;
  }

  if (takePress('coin')) tossCoin(now);

  for (const guard of state.guards) updateGuard(guard, dt, now);
  for (const camera of state.cameras) updateCamera(camera, now);

  // Loot pickup: walk over a piece and it is in the sack.
  level.loot.forEach((item, i) => {
    if (!state.lootTaken[i] && distance(state.player.x, state.player.y, item.x, item.y) < 26) {
      state.lootTaken[i] = true;
      totalHaul += LOOT_VALUES[item.kind];
      state.haul = totalHaul;
      state.player.sackSize += 1;
      sfx.pickup();
    }
  });
  state.haul = totalHaul;

  const caught = updateDetection(state, level, dt);
  if (state.seenBy && now - state.alarmTickAt > 0.34) {
    state.alarmTickAt = now;
    sfx.tick();
  }
  if (caught) {
    state.mode = 'caught';
    sfx.caught();
    return;
  }

  // The getaway only counts with every piece of loot in the sack.
  if (state.lootTaken.every(Boolean) && circleHitsWall(state.player.x, state.player.y, PLAYER_RADIUS, level.exit)) {
    if (state.levelIndex === LEVELS.length - 1) {
      state.mode = 'win';
    } else {
      state.mode = 'clear';
    }
    sfx.clear();
  }
}

let lastStamp = performance.now() / 1000;

function frame() {
  const now = performance.now() / 1000;
  const dt = Math.min(0.05, now - lastStamp);
  lastStamp = now;
  const level = LEVELS[state.levelIndex];

  if (state.mode === 'title') {
    for (const guard of state.guards) updateGuard(guard, dt, now);
    for (const camera of state.cameras) updateCamera(camera, now);
    if (takePress('confirm')) startRun();
  } else if (state.mode === 'playing') {
    updatePlaying(dt, now);
  } else if (state.mode === 'caught') {
    if (takePress('restart')) {
      state = freshLevel(state.levelIndex);
      state.mode = 'playing';
      // Loot from earlier rooms stays banked; this room starts over.
      totalHaul = haulAtLevelStart;
      state.haul = totalHaul;
    }
  } else if (state.mode === 'clear') {
    if (takePress('confirm') || takePress('next')) nextLevel();
  } else if (state.mode === 'win') {
    if (takePress('confirm')) startRun();
  }

  drawScene(ctx, state, level, now);
  requestAnimationFrame(frame);
}

attachInput(canvas);

// A small handle so automated play-tests (and curious players in the
// console) can read the game's state; the game itself never uses it.
window.NightVault = {
  get state() { return state; },
  get level() { return LEVELS[state.levelIndex]; },
};

requestAnimationFrame(frame);
