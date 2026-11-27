// Gobble Dash — hazards and pickups: pumpkins, fences, swinging knives,
// falling knives, ovens, steam jets, haystacks, corn and golden feathers.
// Each one knows how to update, how to hurt (or help), and how to draw itself.

import { GROUND_Y } from './config.js';

export function makePumpkin(x) {
  return { kind: 'pumpkin', x, y: GROUND_Y, r: 22, angle: 0, speed: 90, dir: -1, hit: false };
}

export function makeFence(x) {
  return { kind: 'fence', x, y: GROUND_Y, w: 14, h: 52, hit: false };
}

export function makeSwingKnife(x, length = 90) {
  return { kind: 'swingKnife', x, y: 60, length, angle: 0.5, speed: 1.6, phase: Math.random() * 6, hit: false };
}

export function makeFallingKnife(x) {
  return { kind: 'fallKnife', x, y: -40, vy: 0, stuck: 0, timer: 1 + Math.random() * 2, hit: false };
}

export function makeOven(x, w = 130) {
  return { kind: 'oven', x, y: GROUND_Y, w, phase: Math.random() * 6, burst: 0, hit: false };
}

export function makeSteam(x) {
  return { kind: 'steam', x, y: GROUND_Y, phase: Math.random() * 6, jet: 0, hit: false };
}

export function makeHaystack(x) {
  return { kind: 'haystack', x, y: GROUND_Y, w: 90, h: 56 };
}

export function makeCorn(x, y = GROUND_Y - 34) {
  return { kind: 'corn', x, y, taken: false, bob: Math.random() * 6 };
}

export function makeFeather(x, y = GROUND_Y - 120) {
  return { kind: 'feather', x, y, taken: false, bob: 0 };
}

export function updateHazard(h, dt, t) {
  if (h.kind === 'pumpkin') {
    h.x += h.dir * h.speed * dt;
    h.angle += (h.dir * h.speed * dt) / h.r;
    if (h.x < 60) h.dir = 1;
    if (h.x > 2500) h.dir = -1;
  } else if (h.kind === 'swingKnife') {
    h.angle = Math.sin(t * h.speed + h.phase) * 0.7;
  } else if (h.kind === 'fallKnife') {
    if (h.stuck > 0) {
      h.stuck -= dt;
      if (h.stuck <= 0) { h.y = -40; h.vy = 0; h.timer = 1.5 + Math.random() * 2.5; }
    } else if (h.timer > 0) {
      h.timer -= dt;
    } else {
      h.vy += 1400 * dt;
      h.y += h.vy * dt;
      if (h.y >= GROUND_Y - 46) { h.y = GROUND_Y - 46; h.stuck = 1.6; }
    }
  } else if (h.kind === 'oven') {
    // Flame bursts in a 3.2s cycle: 1.2s of fire, 2s of calm.
    const c = (t + h.phase) % 3.2;
    h.burst = c < 1.2 ? 1 : 0;
  } else if (h.kind === 'steam') {
    const c = (t + h.phase) % 2.6;
    h.jet = c < 0.9 ? 1 : 0;
  }
}

// Hit test: returns 'hurt' | 'stumble' | null. Only the game applies damage.
export function hazardTouch(h, turkey) {
  const tx = turkey.x, ty = turkey.y;
  if (h.kind === 'pumpkin') {
    if (Math.abs(tx - h.x) < h.r + 16 && ty > GROUND_Y - 50) return 'hurt';
  } else if (h.kind === 'fence') {
    if (Math.abs(tx - h.x) < 12 + 16 && ty > GROUND_Y - h.h) return 'stumble';
  } else if (h.kind === 'swingKnife') {
    const bx = h.x + Math.sin(h.angle) * h.length;
    const by = 60 + Math.cos(h.angle) * h.length;
    if (Math.abs(tx - bx) < 26 && Math.abs(ty + 20 - by) < 34) return 'hurt';
  } else if (h.kind === 'fallKnife') {
    if (h.stuck <= 0 && h.timer <= 0 && Math.abs(tx - h.x) < 22 && ty > h.y - 20 && ty < GROUND_Y + 10) return 'hurt';
  } else if (h.kind === 'oven') {
    if (h.burst && tx > h.x - h.w / 2 && tx < h.x + h.w / 2 && ty > GROUND_Y - 90) return 'hurt';
  } else if (h.kind === 'steam') {
    if (h.jet && Math.abs(tx - h.x) < 20 && ty > GROUND_Y - 150) return 'hurt';
  }
  return null;
}

export function drawHazard(ctx, h, camX, t) {
  const sx = h.x - camX;
  if (sx < -120 || sx > 1080) return;
  ctx.save();
  if (h.kind === 'pumpkin') {
    ctx.translate(sx, h.y);
    ctx.rotate(h.angle);
    ctx.fillStyle = '#e07b1f';
    ctx.beginPath();
    ctx.ellipse(0, -h.r, h.r, h.r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b85a10';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 8, -h.r, 6, h.r * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#4a7a2a';
    ctx.fillRect(-3, -h.r * 2 - 4, 6, 8);
  } else if (h.kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(sx - 7, h.y - h.h, 14, h.h);
    ctx.fillRect(sx - 26, h.y - h.h + 8, 52, 7);
    ctx.fillRect(sx - 26, h.y - h.h + 26, 52, 7);
  } else if (h.kind === 'swingKnife') {
    const bx = sx + Math.sin(h.angle) * h.length;
    const by = 60 + Math.cos(h.angle) * h.length;
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, 60);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(h.angle + Math.PI / 2);
    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath();
    ctx.moveTo(0, -26); ctx.lineTo(9, 6); ctx.lineTo(-9, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6b3a1f';
    ctx.fillRect(-5, 6, 10, 12);
    ctx.restore();
  } else if (h.kind === 'fallKnife') {
    if (h.timer > 0 && h.y < 0) {
      // Warning glint where the knife is about to fall.
      ctx.fillStyle = 'rgba(255,60,40,0.7)';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', sx, 60 + Math.sin(t * 8) * 4);
    } else {
      ctx.save();
      ctx.translate(sx, h.y);
      ctx.fillStyle = '#c9c9c9';
      ctx.beginPath();
      ctx.moveTo(0, -26); ctx.lineTo(9, 6); ctx.lineTo(-9, 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6b3a1f';
      ctx.fillRect(-5, 6, 10, 12);
      ctx.restore();
    }
  } else if (h.kind === 'oven') {
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(sx - h.w / 2, h.y - 78, h.w, 78);
    ctx.fillStyle = '#111';
    ctx.fillRect(sx - h.w / 2 + 10, h.y - 66, h.w - 20, 44);
    if (h.burst) {
      const f = Math.sin(t * 22) * 4;
      ctx.fillStyle = '#ff7b1c';
      ctx.beginPath();
      ctx.moveTo(sx - h.w / 2 + 14, h.y - 24);
      ctx.quadraticCurveTo(sx - h.w / 4, h.y - 70 - f, sx, h.y - 24);
      ctx.quadraticCurveTo(sx + h.w / 4, h.y - 70 - f, sx + h.w / 2 - 14, h.y - 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd23c';
      ctx.beginPath();
      ctx.ellipse(sx, h.y - 30, 18, 12 + f * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#3a3a3a';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OVEN', sx, h.y - 30);
    }
  } else if (h.kind === 'steam') {
    if (h.jet) {
      ctx.fillStyle = 'rgba(230,240,255,0.75)';
      ctx.beginPath();
      ctx.ellipse(sx, h.y - 80, 16 + Math.sin(t * 10) * 3, 80, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#777';
    ctx.fillRect(sx - 16, h.y - 10, 32, 10);
  } else if (h.kind === 'haystack') {
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath();
    ctx.moveTo(sx - h.w / 2, h.y);
    ctx.quadraticCurveTo(sx, h.y - h.h - 18, sx + h.w / 2, h.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8933a';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + i * 16, h.y - 8);
      ctx.quadraticCurveTo(sx + i * 16 + 6, h.y - 30, sx + i * 16, h.y - 48);
      ctx.stroke();
    }
  } else if (h.kind === 'corn') {
    if (h.taken) { ctx.restore(); return; }
    const bobY = Math.sin(t * 3 + h.bob) * 4;
    ctx.translate(sx, h.y + bobY);
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 13, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a13c';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 4, 0, 2, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#4a7a2a';
    ctx.beginPath();
    ctx.moveTo(0, 12); ctx.lineTo(-8, 20); ctx.lineTo(8, 20);
    ctx.closePath();
    ctx.fill();
  } else if (h.kind === 'feather') {
    if (h.taken) { ctx.restore(); return; }
    const bobY = Math.sin(t * 2.5 + h.bob) * 6;
    ctx.translate(sx, h.y + bobY);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 18, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8960a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(0, 16);
    ctx.stroke();
  }
  ctx.restore();
}
