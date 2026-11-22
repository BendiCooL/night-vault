// levels.js — the three rooms of Night Vault, as plain data: wall blocks,
// loot, guard patrols, sweeping cameras, the thief's entry point and the
// getaway door. The room is 1280x720 with a 56px HUD bar across the top;
// the border walls below frame every room.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const HUD_HEIGHT = 56;

function borderWalls() {
  return [
    { x: 0, y: HUD_HEIGHT, w: VIEW_WIDTH, h: 24 },
    { x: 0, y: VIEW_HEIGHT - 24, w: VIEW_WIDTH, h: 24 },
    { x: 0, y: HUD_HEIGHT, w: 24, h: VIEW_HEIGHT - HUD_HEIGHT },
    { x: VIEW_WIDTH - 24, y: HUD_HEIGHT, w: 24, h: VIEW_HEIGHT - HUD_HEIGHT },
  ];
}

function room(walls) {
  return borderWalls().concat(walls);
}

export const LOOT_VALUES = {
  cash: 250,
  painting: 400,
  gold: 500,
  gem: 650,
  crown: 1000,
};

export const LEVELS = [
  {
    name: 'The Gallery',
    tagline: 'Quiet pictures, loud money. Two guards, one camera.',
    coins: 2,
    playerStart: { x: 90, y: 620 },
    exit: { x: 1188, y: 320, w: 68, h: 84 },
    walls: room([
      { x: 300, y: 80, w: 24, h: 300 },
      { x: 300, y: 470, w: 24, h: 226 },
      { x: 560, y: 250, w: 300, h: 24 },
      { x: 836, y: 250, w: 24, h: 280 },
      { x: 560, y: 530, w: 180, h: 24 },
      { x: 120, y: 250, w: 120, h: 90 },
      { x: 980, y: 470, w: 24, h: 226 },
    ]),
    loot: [
      { x: 180, y: 160, kind: 'painting' },
      { x: 450, y: 610, kind: 'gem' },
      { x: 700, y: 160, kind: 'cash' },
      { x: 1010, y: 160, kind: 'gold' },
      { x: 1100, y: 610, kind: 'gem' },
    ],
    guards: [
      { speed: 70, waypoints: [{ x: 420, y: 140 }, { x: 1080, y: 140 }] },
      { speed: 62, waypoints: [{ x: 1120, y: 600 }, { x: 1120, y: 210 }] },
    ],
    cameras: [
      { x: 640, y: 88, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.7, phase: 0 },
    ],
  },
  {
    name: 'The Counting House',
    tagline: 'Rows of desks, rows of money. Three guards, two cameras.',
    coins: 2,
    playerStart: { x: 90, y: 140 },
    exit: { x: 24, y: 596, w: 64, h: 84 },
    walls: room([
      { x: 220, y: 220, w: 200, h: 36 },
      { x: 220, y: 420, w: 200, h: 36 },
      { x: 560, y: 220, w: 200, h: 36 },
      { x: 560, y: 420, w: 200, h: 36 },
      { x: 900, y: 220, w: 200, h: 36 },
      { x: 900, y: 420, w: 200, h: 36 },
      { x: 470, y: 80, w: 24, h: 180 },
      { x: 810, y: 460, w: 24, h: 236 },
    ]),
    loot: [
      { x: 320, y: 330, kind: 'cash' },
      { x: 660, y: 330, kind: 'cash' },
      { x: 1000, y: 330, kind: 'gold' },
      { x: 320, y: 570, kind: 'gem' },
      { x: 660, y: 150, kind: 'painting' },
      { x: 1000, y: 570, kind: 'crown' },
    ],
    guards: [
      { speed: 78, waypoints: [{ x: 150, y: 345 }, { x: 1130, y: 345 }] },
      { speed: 66, waypoints: [{ x: 520, y: 610 }, { x: 520, y: 300 }] },
      { speed: 72, waypoints: [{ x: 1130, y: 620 }, { x: 1130, y: 150 }] },
    ],
    cameras: [
      { x: 320, y: 88, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.8, phase: 0 },
      { x: 960, y: 688, baseAngle: -Math.PI / 2, sweep: 1.0, speed: 0.65, phase: 2.1 },
    ],
  },
  {
    name: 'The Vault',
    tagline: 'Everything they own, behind everything they have. Four guards, three cameras.',
    coins: 3,
    playerStart: { x: 90, y: 620 },
    exit: { x: 596, y: 80, w: 88, h: 54 },
    walls: room([
      { x: 200, y: 200, w: 24, h: 320 },
      { x: 200, y: 200, w: 280, h: 24 },
      { x: 456, y: 200, w: 24, h: 180 },
      { x: 640, y: 330, w: 24, h: 366 },
      { x: 640, y: 330, w: 300, h: 24 },
      { x: 916, y: 330, w: 24, h: 200 },
      { x: 1020, y: 120, w: 24, h: 210 },
      { x: 340, y: 540, w: 180, h: 24 },
      { x: 820, y: 560, w: 220, h: 24 },
    ]),
    loot: [
      { x: 120, y: 130, kind: 'gem' },
      { x: 560, y: 275, kind: 'painting' },
      { x: 760, y: 150, kind: 'crown' },
      { x: 1130, y: 250, kind: 'painting' },
      { x: 770, y: 450, kind: 'gold' },
      { x: 1080, y: 630, kind: 'cash' },
      { x: 290, y: 630, kind: 'gem' },
      { x: 460, y: 450, kind: 'cash' },
    ],
    guards: [
      { speed: 84, waypoints: [{ x: 120, y: 610 }, { x: 580, y: 610 }] },
      { speed: 80, waypoints: [{ x: 760, y: 140 }, { x: 980, y: 140 }] },
      { speed: 76, waypoints: [{ x: 1080, y: 420 }, { x: 1080, y: 640 }] },
      { speed: 70, waypoints: [{ x: 560, y: 620 }, { x: 560, y: 440 }] },
    ],
    cameras: [
      { x: 300, y: 88, baseAngle: Math.PI / 2, sweep: 0.95, speed: 0.75, phase: 0 },
      { x: 1248, y: 400, baseAngle: Math.PI, sweep: 0.85, speed: 0.6, phase: 1.4 },
      { x: 32, y: 400, baseAngle: 0, sweep: 0.85, speed: 0.55, phase: 3.6 },
    ],
  },
];
