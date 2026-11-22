// input.js — keyboard state and mouse position. Movement keys are tracked
// as a held-set so diagonal walking works; discrete presses (coin toss,
// restart, start) are queued as one-shot actions for main.js to consume.

const held = new Set();
const pressed = new Set();
export const mouse = { x: 0, y: 0 };

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'coin', KeyE: 'coin',
  Enter: 'confirm',
  KeyR: 'restart',
  KeyN: 'next',
};

export function attachInput(canvas) {
  window.addEventListener('keydown', (event) => {
    const action = KEYMAP[event.code];
    if (!action) return;
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right' || action === 'coin') {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(action);
    held.add(action);
  });
  window.addEventListener('keyup', (event) => {
    const action = KEYMAP[event.code];
    if (action) held.delete(action);
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener('mousedown', () => pressed.add('coin'));
}

export function moveVector() {
  let x = 0;
  let y = 0;
  if (held.has('left')) x -= 1;
  if (held.has('right')) x += 1;
  if (held.has('up')) y -= 1;
  if (held.has('down')) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = Math.SQRT1_2;
    return { x: x * inv, y: y * inv };
  }
  return { x, y };
}

// Consume a one-shot press: true once per physical press.
export function takePress(action) {
  if (!pressed.has(action)) return false;
  pressed.delete(action);
  return true;
}
