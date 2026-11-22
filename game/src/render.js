// render.js — everything Night Vault draws: the room, the cones, the crew
// and the HUD. Pure canvas 2D, flat shapes with soft glows, so safe cover,
// danger and loot read at a glance even in a shrunken screenshot.

import { COLOURS as C } from './palette.js';
import { HUD_HEIGHT, VIEW_HEIGHT, VIEW_WIDTH } from './levels.js';
import { GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE } from './guards.js';
import { CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE } from './cameras.js';

function drawFloor(ctx, now) {
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, HUD_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT - HUD_HEIGHT);
  ctx.strokeStyle = C.floorLine;
  ctx.lineWidth = 1;
  const tile = 46;
  ctx.beginPath();
  for (let x = 0; x <= VIEW_WIDTH; x += tile) {
    ctx.moveTo(x, HUD_HEIGHT);
    ctx.lineTo(x, VIEW_HEIGHT);
  }
  for (let y = HUD_HEIGHT; y <= VIEW_HEIGHT; y += tile) {
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_WIDTH, y);
  }
  ctx.stroke();
  // A worn carpet runner across the middle softens the stone.
  ctx.fillStyle = C.carpet;
  ctx.fillRect(24, 356, VIEW_WIDTH - 48, 64);
  ctx.strokeStyle = C.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 356, VIEW_WIDTH - 48, 64);
  void now;
}

function drawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = C.wallShadow;
    ctx.fillRect(w.x + 3, w.y + 5, w.w, w.h);
    ctx.fillStyle = C.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = C.wallTop;
    ctx.fillRect(w.x, w.y, w.w, Math.min(5, w.h));
    ctx.fillRect(w.x, w.y, Math.min(5, w.w), w.h);
  }
}

function drawExit(ctx, level, state, now) {
  const e = level.exit;
  const open = state.lootTaken.every(Boolean);
  const pulse = 0.6 + 0.4 * Math.sin(now * 4);
  ctx.fillStyle = C.exitZone;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = C.exitGlow;
  ctx.globalAlpha = open ? pulse : 0.3;
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x + 2, e.y + 2, e.w - 4, e.h - 4);
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.exitGlow;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const label = open ? 'GETAWAY' : 'EXIT';
  ctx.fillText(label, e.x + e.w / 2, e.y + e.h / 2 + 4);
}

function drawLootItem(ctx, item, now) {
  const { x, y, kind } = item;
  const bob = Math.sin(now * 2.4 + x * 0.05) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
  glow.addColorStop(0, 'rgba(245, 197, 66, 0.35)');
  glow.addColorStop(1, 'rgba(245, 197, 66, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-26, -26, 52, 52);
  if (kind === 'cash') {
    ctx.fillStyle = C.cash;
    ctx.fillRect(-13, -8, 26, 16);
    ctx.fillStyle = C.goldDark;
    ctx.fillRect(-13, -2, 26, 3);
    ctx.fillStyle = '#e9f7d8';
    ctx.fillRect(-4, -5, 8, 10);
  } else if (kind === 'painting') {
    ctx.fillStyle = C.goldDark;
    ctx.fillRect(-15, -13, 30, 26);
    ctx.fillStyle = C.painting;
    ctx.fillRect(-11, -9, 22, 18);
    ctx.fillStyle = '#dceeff';
    ctx.beginPath();
    ctx.moveTo(-11, 9);
    ctx.lineTo(-2, -4);
    ctx.lineTo(4, 4);
    ctx.lineTo(8, -1);
    ctx.lineTo(11, 9);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'gold') {
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.lineTo(-9, -2);
    ctx.lineTo(9, -2);
    ctx.lineTo(14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.goldDark;
    ctx.fillRect(-9, -10, 18, 6);
  } else if (kind === 'gem') {
    ctx.fillStyle = C.gem;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(11, -3);
    ctx.lineTo(0, 14);
    ctx.lineTo(-11, -3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d8fff5';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (kind === 'crown') {
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(-14, 9);
    ctx.lineTo(-14, -6);
    ctx.lineTo(-7, 1);
    ctx.lineTo(0, -11);
    ctx.lineTo(7, 1);
    ctx.lineTo(14, -6);
    ctx.lineTo(14, 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.guard;
    ctx.fillRect(-2.5, 2, 5, 5);
  }
  ctx.restore();
}

function drawCone(ctx, x, y, facing, halfAngle, range, alertness, idleFill, idleEdge, alertFill, alertEdge) {
  const alert = alertness > 0.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = alert ? alertFill : idleFill;
  ctx.fill();
  ctx.strokeStyle = alert ? alertEdge : idleEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGuard(ctx, guard) {
  // Vision cone first, under the body.
  drawCone(ctx, guard.x, guard.y, guard.facing, GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE,
    guard.alertness, C.coneIdle, C.coneEdge, C.coneAlert, C.coneAlertEdge);
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.rotate(guard.facing);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(2, 4, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.guard;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.guardTrim;
  ctx.beginPath();
  ctx.arc(0, 0, 15, -0.6, 0.6);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd9a0';
  ctx.beginPath();
  ctx.arc(4, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (guard.alertness > 0.2) {
    ctx.fillStyle = C.alarmFill;
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - 24);
  }
}

function drawCamera(ctx, camera, now) {
  drawCone(ctx, camera.x, camera.y, camera.angle, CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE,
    camera.alertness, C.cameraCone, C.cameraConeEdge, C.cameraConeAlert, C.cameraConeEdge);
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.rotate(camera.angle);
  ctx.fillStyle = C.cameraBody;
  ctx.fillRect(-9, -7, 18, 14);
  ctx.fillStyle = C.cameraLens;
  ctx.beginPath();
  ctx.arc(8, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = Math.sin(now * 5) > 0 ? C.alarmFill : '#571f1f';
  ctx.beginPath();
  ctx.arc(camera.x, camera.y - 10, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawThief(ctx, player, now) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(2, 5, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Loot sack on the back, growing with the haul.
  const sack = 6 + Math.min(7, player.sackSize);
  ctx.fillStyle = C.thiefSack;
  ctx.beginPath();
  ctx.arc(-Math.cos(player.facing) * 10, -Math.sin(player.facing) * 10, sack, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.thiefTrim;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.thief;
  ctx.beginPath();
  ctx.arc(Math.cos(player.facing) * 3, Math.sin(player.facing) * 3, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void now;
}

function drawCoinPings(ctx, state, now) {
  for (const ping of state.coinPings) {
    const age = now - ping.at;
    if (age < 0 || age > 1.2) continue;
    ctx.strokeStyle = C.gold;
    ctx.globalAlpha = 1 - age / 1.2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ping.x, ping.y, 6 + age * 46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.arc(ping.x, ping.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, state, level) {
  ctx.fillStyle = C.hudBar;
  ctx.fillRect(0, 0, VIEW_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = C.hudText;
  ctx.textAlign = 'left';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText(`NIGHT VAULT — ${level.name}`, 18, 35);

  const taken = state.lootTaken.filter(Boolean).length;
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.fillText(`LOOT ${taken}/${level.loot.length}`, 470, 35);
  ctx.fillStyle = C.hudDim;
  ctx.fillText(`COINS ×${state.coinsLeft} (SPACE/click: toss)`, 580, 35);
  ctx.fillStyle = C.hudText;
  ctx.fillText(`HAUL $${state.haul.toLocaleString('en-US')}`, 880, 35);

  // The alarm meter: always on screen, always readable.
  ctx.fillStyle = C.hudDim;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('ALARM', 1032, 20);
  ctx.fillStyle = C.alarmTrack;
  ctx.fillRect(1032, 26, 230, 16);
  ctx.fillStyle = state.alarm > 55 ? C.alarmFill : C.alarmCalm;
  ctx.fillRect(1032, 26, (state.alarm / 100) * 230, 16);
  ctx.strokeStyle = C.hudDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(1032, 26, 230, 16);
  if (state.seenBy) {
    ctx.fillStyle = C.alarmFill;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(state.seenBy === 'guard' ? 'SPOTTED!' : 'ON CAMERA!', 1032, 54 - 2);
  }
}

function drawCentredText(ctx, lines) {
  ctx.fillStyle = C.overlay;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.textAlign = 'center';
  let y = 250;
  for (const line of lines) {
    ctx.fillStyle = line.colour;
    ctx.font = `${line.bold ? 'bold ' : ''}${line.size}px system-ui, sans-serif`;
    ctx.fillText(line.text, VIEW_WIDTH / 2, y);
    y += line.size + 16;
  }
}

export function drawScene(ctx, state, level, now) {
  drawFloor(ctx, now);
  drawExit(ctx, level, state, now);
  level.loot.forEach((item, i) => {
    if (!state.lootTaken[i]) drawLootItem(ctx, item, now);
  });
  drawWalls(ctx, level);
  for (const camera of state.cameras) drawCamera(ctx, camera, now);
  for (const guard of state.guards) drawGuard(ctx, guard);
  drawCoinPings(ctx, state, now);
  drawThief(ctx, state.player, now);
  drawHud(ctx, state, level);

  if (state.mode === 'title') {
    drawCentredText(ctx, [
      { text: 'NIGHT VAULT', size: 64, bold: true, colour: C.gold },
      { text: level.tagline, size: 20, colour: C.hudText },
      { text: 'Sneak past the cones, take every piece of loot, reach the GETAWAY.', size: 18, colour: C.hudText },
      { text: 'Move: WASD / arrows · Toss a coin to distract guards: SPACE or click', size: 18, colour: C.hudDim },
      { text: 'Being seen fills the ALARM meter. Full meter = caught.', size: 18, colour: C.hudDim },
      { text: 'Press ENTER to start the heist', size: 22, bold: true, colour: C.exitGlow },
    ]);
  } else if (state.mode === 'caught') {
    drawCentredText(ctx, [
      { text: 'CAUGHT!', size: 58, bold: true, colour: C.alarmFill },
      { text: 'The alarm hit full and the doors slammed shut.', size: 20, colour: C.hudText },
      { text: 'Press R to try this room again', size: 22, bold: true, colour: C.exitGlow },
    ]);
  } else if (state.mode === 'clear') {
    drawCentredText(ctx, [
      { text: 'ROOM CLEANED OUT', size: 46, bold: true, colour: C.exitGlow },
      { text: `Haul so far: $${state.haul.toLocaleString('en-US')}`, size: 22, colour: C.gold },
      { text: 'Press ENTER for the next room', size: 22, bold: true, colour: C.hudText },
    ]);
  } else if (state.mode === 'win') {
    drawCentredText(ctx, [
      { text: 'THE VAULT IS EMPTY', size: 52, bold: true, colour: C.gold },
      { text: `Total haul: $${state.haul.toLocaleString('en-US')} in ${Math.round(state.elapsed)} seconds`, size: 22, colour: C.hudText },
      { text: 'Not a single alarm tripped the doors. A clean night.', size: 18, colour: C.hudDim },
      { text: 'Press ENTER to play again', size: 22, bold: true, colour: C.exitGlow },
    ]);
  }
}
