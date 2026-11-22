// guards.js — patrol guards: they walk their waypoint loop, pause at each
// end to look around, and can be fooled by a tossed coin (see main.js).
// A guard's runtime state is built from the plain data in levels.js.

import { angleTo, distance } from './geometry.js';

export const GUARD_RADIUS = 15;
export const GUARD_VIEW_RANGE = 185;
export const GUARD_VIEW_HALF_ANGLE = 0.56; // about 32 degrees
const PAUSE_SECONDS = 0.9;

export function createGuard(spec) {
  const first = spec.waypoints[0];
  const second = spec.waypoints[1] ?? first;
  return {
    x: first.x,
    y: first.y,
    waypoints: spec.waypoints,
    targetIndex: 1,
    speed: spec.speed,
    facing: Math.atan2(second.y - first.y, second.x - first.x),
    pauseLeft: 0,
    distractedUntil: -1,
    distractX: 0,
    distractY: 0,
    alertness: 0, // 0 calm .. 1 has eyes on the thief right now
  };
}

// A coin lands: every guard close enough turns to stare at it for a while.
export function distractGuard(guard, x, y, now, radius) {
  if (distance(guard.x, guard.y, x, y) <= radius) {
    guard.distractedUntil = now + 2.6;
    guard.distractX = x;
    guard.distractY = y;
  }
}

export function updateGuard(guard, dt, now) {
  if (now < guard.distractedUntil) {
    guard.facing = angleTo(guard.x, guard.y, guard.distractX, guard.distractY);
    return;
  }
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    return;
  }
  const target = guard.waypoints[guard.targetIndex];
  const d = distance(guard.x, guard.y, target.x, target.y);
  const step = guard.speed * dt;
  if (d <= step) {
    guard.x = target.x;
    guard.y = target.y;
    guard.targetIndex = (guard.targetIndex + 1) % guard.waypoints.length;
    guard.pauseLeft = PAUSE_SECONDS;
    const next = guard.waypoints[guard.targetIndex];
    guard.facing = angleTo(guard.x, guard.y, next.x, next.y);
    return;
  }
  guard.facing = angleTo(guard.x, guard.y, target.x, target.y);
  guard.x += Math.cos(guard.facing) * step;
  guard.y += Math.sin(guard.facing) * step;
}
