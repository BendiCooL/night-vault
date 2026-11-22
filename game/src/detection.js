// detection.js — the alarm meter. Being inside a guard's or a camera's
// cone, unhidden by a wall, fills it; hiding lets it drain. A full meter
// means caught. Closer eyes fill it faster — that is the tension dial.

import { insideCone } from './geometry.js';
import { GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE } from './guards.js';
import { CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE } from './cameras.js';

const GUARD_FILL_RATE = 62; // percent per second at point blank
const CAMERA_FILL_RATE = 44;
const DRAIN_RATE = 15;

export function updateDetection(state, level, dt) {
  let worst = null;

  for (const guard of state.guards) {
    const hit = insideCone(
      guard.x, guard.y, guard.facing, GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE,
      state.player.x, state.player.y, level.walls,
    );
    guard.alertness = hit.seen ? Math.min(1, guard.alertness + dt * 5) : Math.max(0, guard.alertness - dt * 3);
    if (hit.seen) {
      const rate = GUARD_FILL_RATE * (0.35 + 0.65 * hit.closeness);
      if (!worst || rate > worst.rate) worst = { rate, kind: 'guard' };
    }
  }

  for (const camera of state.cameras) {
    const hit = insideCone(
      camera.x, camera.y, camera.angle, CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE,
      state.player.x, state.player.y, level.walls,
    );
    camera.alertness = hit.seen ? Math.min(1, camera.alertness + dt * 5) : Math.max(0, camera.alertness - dt * 3);
    if (hit.seen) {
      const rate = CAMERA_FILL_RATE * (0.35 + 0.65 * hit.closeness);
      if (!worst || rate > worst.rate) worst = { rate, kind: 'camera' };
    }
  }

  state.seenBy = worst ? worst.kind : null;
  if (worst) {
    state.alarm = Math.min(100, state.alarm + worst.rate * dt);
  } else {
    state.alarm = Math.max(0, state.alarm - DRAIN_RATE * dt);
  }
  return state.alarm >= 100;
}
