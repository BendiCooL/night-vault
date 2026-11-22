// cameras.js — wall cameras: fixed in place, their cones sweep back and
// forth on a sine, patient and tireless. Runtime state from levels.js data.

export const CAMERA_VIEW_RANGE = 165;
export const CAMERA_VIEW_HALF_ANGLE = 0.42; // about 24 degrees

export function createCamera(spec) {
  return {
    x: spec.x,
    y: spec.y,
    baseAngle: spec.baseAngle,
    sweep: spec.sweep,
    speed: spec.speed,
    phase: spec.phase,
    angle: spec.baseAngle,
    alertness: 0,
  };
}

export function updateCamera(camera, now) {
  camera.angle = camera.baseAngle + Math.sin(now * camera.speed + camera.phase) * camera.sweep;
}
