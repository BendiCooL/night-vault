// geometry.js — small pure helpers shared by movement, patrols and sight:
// distances, angles, circle-vs-wall collision and line of sight.

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Smallest signed difference between two angles, in (-PI, PI].
export function angleDifference(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

// Does the circle at (x, y) with radius r overlap the rectangle wall?
export function circleHitsWall(x, y, r, wall) {
  const nearestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
  const nearestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
  return distance(x, y, nearestX, nearestY) < r;
}

// Move a circle by (dx, dy), sliding along any wall it would enter. Tries
// the full move, then each axis alone, so corners feel smooth not sticky.
export function slideMove(x, y, r, dx, dy, walls) {
  if (!walls.some((w) => circleHitsWall(x + dx, y + dy, r, w))) {
    return { x: x + dx, y: y + dy };
  }
  if (!walls.some((w) => circleHitsWall(x + dx, y, r, w))) {
    return { x: x + dx, y };
  }
  if (!walls.some((w) => circleHitsWall(x, y + dy, r, w))) {
    return { x, y: y + dy };
  }
  return { x, y };
}

// Line of sight between two points: false when any wall blocks the segment.
// Samples along the segment; walls are chunky, so sampling is exact enough.
export function lineOfSight(ax, ay, bx, by, walls) {
  const steps = Math.max(2, Math.ceil(distance(ax, ay, bx, by) / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = ax + (bx - ax) * t;
    const py = ay + (by - ay) * t;
    for (const w of walls) {
      if (px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h) {
        return false;
      }
    }
  }
  return true;
}

// Is the target inside a vision cone cast from (ox, oy) facing `facing`,
// and close/clear enough to be seen?
export function insideCone(ox, oy, facing, halfAngle, range, tx, ty, walls) {
  const d = distance(ox, oy, tx, ty);
  if (d > range) return { seen: false, closeness: 0 };
  if (d > 26 && Math.abs(angleDifference(facing, angleTo(ox, oy, tx, ty))) > halfAngle) {
    return { seen: false, closeness: 0 };
  }
  if (!lineOfSight(ox, oy, tx, ty, walls)) return { seen: false, closeness: 0 };
  return { seen: true, closeness: 1 - d / range };
}
