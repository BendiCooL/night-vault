// sound.js — tiny WebAudio blips, synthesised live (no audio files, so the
// game stays fully offline). Everything is wrapped so a browser that
// refuses audio can never break the game.

let ctx = null;

function tone(freq, seconds, type, volume, when = 0) {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds);
  } catch {
    // Silence is fine; the heist goes on.
  }
}

export const sfx = {
  pickup() {
    tone(880, 0.09, 'sine', 0.12);
    tone(1318, 0.12, 'sine', 0.1, 0.06);
  },
  coin() {
    tone(1568, 0.07, 'square', 0.05);
    tone(1175, 0.1, 'square', 0.04, 0.05);
  },
  tick() {
    tone(220, 0.05, 'square', 0.06);
  },
  caught() {
    tone(392, 0.16, 'sawtooth', 0.12);
    tone(311, 0.16, 'sawtooth', 0.12, 0.14);
    tone(233, 0.3, 'sawtooth', 0.12, 0.28);
  },
  clear() {
    tone(523, 0.1, 'sine', 0.11);
    tone(659, 0.1, 'sine', 0.11, 0.09);
    tone(784, 0.18, 'sine', 0.11, 0.18);
  },
};
