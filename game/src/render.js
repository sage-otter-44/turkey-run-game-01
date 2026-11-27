// Gobble Dash — drawing the world: sky, sun, hills, farm, barn, kitchen,
// plus the HUD, title screen and end screens. All art is code-drawn.

import { VIEW_W, VIEW_H, GROUND_Y } from './config.js';

export function drawBackground(ctx, stage, camX, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, stage.def.sky[0]);
  grad.addColorStop(1, stage.def.sky[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Sun
  ctx.fillStyle = '#fff3c9';
  ctx.beginPath();
  ctx.arc(820 - camX * 0.05, 70, 34, 0, Math.PI * 2);
  ctx.fill();
  // Clouds drift slowly
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 340 + t * 6) % 1200) - 120 - camX * 0.12;
    const cy = 60 + i * 34;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 46, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 30, cy + 6, 32, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Distant hills
  ctx.fillStyle = stage.index === 2 ? '#7a5a40' : '#6a8a3f';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  for (let x = 0; x <= VIEW_W; x += 60) {
    ctx.lineTo(x, 320 + Math.sin((x + camX * 0.3) * 0.008) * 18);
  }
  ctx.lineTo(VIEW_W, VIEW_H);
  ctx.lineTo(0, VIEW_H);
  ctx.closePath();
  ctx.fill();

  if (stage.index === 0) drawFarmyard(ctx, camX);
  else if (stage.index === 1) drawBarn(ctx, camX);
  else drawKitchen(ctx, camX);

  // Ground
  ctx.fillStyle = stage.def.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = stage.def.grass;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
  // Ground texture dashes scrolling with the camera
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  const off = -(camX % 48);
  for (let x = off; x < VIEW_W; x += 48) ctx.fillRect(x, GROUND_Y + 26, 22, 4);
}

function drawFarmyard(ctx, camX) {
  // Red barn silhouette in the distance
  const bx = 300 - camX * 0.4;
  ctx.fillStyle = '#a03a28';
  ctx.fillRect(bx, 250, 150, 110);
  ctx.beginPath();
  ctx.moveTo(bx - 12, 252); ctx.lineTo(bx + 75, 196); ctx.lineTo(bx + 162, 252);
  ctx.closePath();
  ctx.fillStyle = '#7a2a1c';
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(bx + 58, 300, 34, 60);
  // Fence line along the back
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = -(camX % 90); x < VIEW_W; x += 90) {
    ctx.moveTo(x, 330); ctx.lineTo(x, 372);
  }
  ctx.moveTo(0, 344); ctx.lineTo(VIEW_W, 344);
  ctx.moveTo(0, 362); ctx.lineTo(VIEW_W, 362);
  ctx.stroke();
  // Corn stalks at the far edge
  ctx.strokeStyle = '#4a7a2a';
  ctx.lineWidth = 3;
  for (let x = -(camX % 130) + 40; x < VIEW_W; x += 130) {
    ctx.beginPath();
    ctx.moveTo(x, 380); ctx.lineTo(x + 8, 300);
    ctx.moveTo(x, 380); ctx.lineTo(x - 8, 312);
    ctx.stroke();
  }
}

function drawBarn(ctx, camX) {
  // Wooden wall planks
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(0, 120, VIEW_W, 240);
  ctx.strokeStyle = '#5a3416';
  ctx.lineWidth = 2;
  for (let y = 140; y < 360; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); ctx.stroke();
  }
  // Hanging lanterns
  for (let i = 0; i < 3; i++) {
    const lx = ((i * 360 + 120 - camX * 0.2) % 1100 + 1100) % 1100 - 60;
    ctx.strokeStyle = '#3a2410';
    ctx.beginPath(); ctx.moveTo(lx, 120); ctx.lineTo(lx, 150); ctx.stroke();
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath(); ctx.arc(lx, 160, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,210,60,0.25)';
    ctx.beginPath(); ctx.arc(lx, 160, 26, 0, Math.PI * 2); ctx.fill();
  }
  // Big round barn window
  ctx.fillStyle = '#2b1a0e';
  ctx.beginPath(); ctx.arc(480 - camX * 0.15, 210, 44, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8b25a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(480 - camX * 0.15, 210, 44, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(480 - camX * 0.15 - 44, 210); ctx.lineTo(480 - camX * 0.15 + 44, 210);
  ctx.moveTo(480 - camX * 0.15, 166); ctx.lineTo(480 - camX * 0.15, 254);
  ctx.stroke();
}

function drawKitchen(ctx, camX) {
  // Checkerboard tile wall
  const s = 46;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 22; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#e8dcc8' : '#c9b896';
      ctx.fillRect(x * s - (camX * 0.3 % s), y * s, s, s);
    }
  }
  // Hanging pots and pans
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const px = ((i * 260 + 90 - camX * 0.25) % 1100 + 1100) % 1100 - 60;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, 46); ctx.stroke();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(px, 62, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(px, 62, 12, 0, Math.PI * 2); ctx.fill();
  }
  // Fridge silhouette at the back
  const fx = 700 - camX * 0.35;
  ctx.fillStyle = '#b8c8d0';
  ctx.fillRect(fx, 180, 90, 180);
  ctx.strokeStyle = '#8a9aa2';
  ctx.strokeRect(fx, 180, 90, 180);
  ctx.beginPath(); ctx.moveTo(fx, 240); ctx.lineTo(fx + 90, 240); ctx.stroke();
}

export function drawExitDoor(ctx, stage, camX, t) {
  const sx = stage.exitX - camX;
  if (sx < -80 || sx > VIEW_W + 80) return;
  const glow = 0.5 + Math.sin(t * 4) * 0.2;
  ctx.fillStyle = `rgba(120,220,120,${glow * 0.35})`;
  ctx.fillRect(sx - 46, GROUND_Y - 150, 92, 150);
  ctx.fillStyle = '#2e7a32';
  ctx.fillRect(sx - 34, GROUND_Y - 130, 68, 130);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', sx, GROUND_Y - 140);
  ctx.fillStyle = '#ffd23c';
  ctx.beginPath();
  ctx.arc(sx + 22, GROUND_Y - 66, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawHud(ctx, game) {
  const pad = 14;
  ctx.save();
  // Top bar
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  ctx.fillRect(0, 0, VIEW_W, 52);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  // Lives as hearts
  let hx = pad;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < game.turkey.lives ? '#e8452c' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx + 7, 22, 8, 0, Math.PI * 2);
    ctx.arc(hx + 19, 22, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx, 26); ctx.lineTo(hx + 26, 26); ctx.lineTo(hx + 13, 40);
    ctx.closePath();
    ctx.fill();
    hx += 34;
  }
  ctx.fillStyle = '#fff';
  ctx.fillText(`SCORE ${game.score}`, 130, 30);
  ctx.fillStyle = '#ffd23c';
  ctx.fillText(`CORN ${game.turkey.corn}`, 280, 30);
  ctx.fillStyle = '#fff';
  ctx.fillText(game.stage.def.name, 400, 30);
  // Progress to the exit
  const prog = Math.min(1, Math.max(0, game.turkey.x / game.stage.width));
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(700, 18, 180, 10);
  ctx.fillStyle = '#7ed957';
  ctx.fillRect(700, 18, 180 * prog, 10);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('EXIT →', 886, 28);
  // Farmer proximity warning
  const dist = Math.abs(game.farmer.x - game.turkey.x);
  if (game.farmer.state === 'chase' && dist < 260) {
    const blink = Math.floor(game.time * 6) % 2 === 0;
    ctx.fillStyle = blink ? '#ff3b30' : '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ FARMER CLOSE! SPRINT! ⚠', VIEW_W / 2, 84);
  }
  // Stage hint at the start of a stage
  if (game.stageTimer < 4) {
    ctx.fillStyle = 'rgba(30,20,10,0.6)';
    ctx.fillRect(180, 96, 600, 34);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.stage.def.hint, VIEW_W / 2, 118);
  }
  if (game.sounds.muted) {
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('MUTED (M)', VIEW_W - 12, 74);
  }
  ctx.restore();
}

export function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(40,20,5,0.45)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('GOBBLE DASH', VIEW_W / 2, 150);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('A Thanksgiving Breakout', VIEW_W / 2, 192);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('Giblet the turkey is on the menu tonight. Run the farmyard,', VIEW_W / 2, 240);
  ctx.fillText('sneak through the barn, dodge the oven — and reach the back door!', VIEW_W / 2, 264);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) ctx.fillText('▶ PRESS ENTER OR CLICK TO START ◀', VIEW_W / 2, 330);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('← → / A D move      ↑ / SPACE jump (twice = flap)      SHIFT sprint', VIEW_W / 2, 380);
  ctx.fillText('H hide in a haystack      M mute      P pause      R restart', VIEW_W / 2, 406);
  ctx.fillStyle = '#fff';
  ctx.font = '15px sans-serif';
  ctx.fillText('The farmer never gives up. The oven is hot. The knives fall. Good luck, bird.', VIEW_W / 2, 452);
  if (game.best > 0) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`BEST SCORE: ${game.best}`, VIEW_W / 2, 492);
  }
}

export function drawEnd(ctx, game) {
  ctx.fillStyle = 'rgba(20,10,5,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  if (game.state === 'caught') {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('CAUGHT!', VIEW_W / 2, 170);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Farmer Bram got you. Thanksgiving dinner is served…', VIEW_W / 2, 214);
    ctx.fillText('…unless you try again. The turkey always gets another run.', VIEW_W / 2, 242);
  } else {
    ctx.fillStyle = '#7ed957';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('ESCAPED!', VIEW_W / 2, 170);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Giblet slipped out the back door and into the woods.', VIEW_W / 2, 214);
    ctx.fillText('No turkey dinners tonight — not this bird, not ever.', VIEW_W / 2, 242);
  }
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`SCORE ${game.score}    CORN ${game.turkey.corn}`, VIEW_W / 2, 300);
  if (game.state === 'escaped') {
    ctx.fillStyle = '#fff';
    ctx.font = '17px sans-serif';
    ctx.fillText(`Time ${game.runTime.toFixed(1)}s   •   Stages cleared 3/3   •   Lives left ${game.turkey.lives}`, VIEW_W / 2, 332);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', VIEW_W / 2, 392);
  if (game.score > game.best) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('★ NEW BEST SCORE! ★', VIEW_W / 2, 432);
  }
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,10,5,0.5)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2);
  ctx.font = '17px sans-serif';
  ctx.fillText('Press P to keep running', VIEW_W / 2, VIEW_H / 2 + 36);
}
