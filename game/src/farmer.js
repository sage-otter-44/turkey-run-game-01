// Gobble Dash — Farmer Bram: patrols, chases, searches, and corners.
// He is slower than a sprinting turkey but never, ever gives up.

import { GROUND_Y, FARMER } from './config.js';

export class Farmer {
  constructor() {
    this.reset(40);
    this.state = 'patrol'; // patrol | chase | search
    this.stateTimer = 0;
    this.lastSeenX = 0;
    this.grace = 0; // seconds after a (re)spawn when he strolls in and cannot catch
  }

  reset(x) {
    this.x = x;
    this.y = GROUND_Y;
    this.vx = 0;
    this.dir = 1;
    this.state = 'patrol';
    this.stateTimer = 0;
    this.runCycle = 0;
    this.searchSpot = x;
    this.grace = 2.0; // the turkey gets a two-second head start, every stage
  }

  get w() { return 40; }
  get h() { return 62; }

  // Returns true when the farmer's hands close on the turkey.
  update(dt, turkey, stageWidth) {
    const dx = turkey.x - this.x;
    const dist = Math.abs(dx);
    const canSee = !turkey.hidden && dist < FARMER.spotRange && turkey.y > GROUND_Y - 120;

    // Grace period: he strolls in from off-screen and cannot catch yet.
    if (this.grace > 0) {
      this.grace -= dt;
      this.dir = dx >= 0 ? 1 : -1;
      this.vx = this.dir * FARMER.patrolSpeed;
      this.x += this.vx * dt;
      this.x = Math.max(-120, Math.min(stageWidth - 10, this.x));
      this.runCycle += Math.abs(this.vx) * dt * 0.05;
      return false;
    }

    if (this.state === 'patrol') {
      this.dir = dx >= 0 ? 1 : -1;
      this.vx = this.dir * FARMER.patrolSpeed;
      if (canSee) {
        this.state = 'chase';
        this.lastSeenX = turkey.x;
      }
    } else if (this.state === 'chase') {
      this.dir = dx >= 0 ? 1 : -1;
      // If the turkey vanishes into a haystack, the farmer searches where he last saw it.
      if (turkey.hidden || !canSee) {
        if (dist > FARMER.spotRange * 1.4 || turkey.hidden) {
          this.state = 'search';
          this.stateTimer = FARMER.searchTime;
          this.searchSpot = this.lastSeenX;
        }
      } else {
        this.lastSeenX = turkey.x;
      }
      // He jogs to close a big gap, but never teleports: a fair chase.
      this.vx = this.dir * (dist > 420 ? FARMER.catchUpSpeed : FARMER.chaseSpeed);
      if (dist < FARMER.catchDistance && Math.abs(turkey.y - GROUND_Y) < 40) return true;
    } else if (this.state === 'search') {
      this.stateTimer -= dt;
      const sdx = this.searchSpot - this.x;
      if (Math.abs(sdx) > 12) {
        this.dir = sdx >= 0 ? 1 : -1;
        this.vx = this.dir * FARMER.patrolSpeed * 1.6;
      } else {
        this.vx = 0; // stands, scratches his head, looks around
        if (Math.random() < 0.01) this.dir = -this.dir;
      }
      if (canSee) this.state = 'chase';
      else if (this.stateTimer <= 0) this.state = 'patrol';
    }

    this.x += this.vx * dt;
    this.x = Math.max(-120, Math.min(stageWidth - 10, this.x));
    this.runCycle += Math.abs(this.vx) * dt * 0.05;
    return false;
  }

  draw(ctx, camX, t) {
    const sx = this.x - camX;
    const sy = this.y;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(this.dir, 1);
    const swing = Math.sin(this.runCycle * 2) * 6;
    // Legs (overalls)
    ctx.strokeStyle = '#3a5a8c';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-5, -30); ctx.lineTo(-5 + swing, 0);
    ctx.moveTo(5, -30); ctx.lineTo(5 - swing, 0);
    ctx.stroke();
    // Body: plaid shirt
    ctx.fillStyle = '#b03a2e';
    ctx.fillRect(-13, -58, 26, 30);
    ctx.strokeStyle = '#7a241c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-13, -48); ctx.lineTo(13, -48);
    ctx.moveTo(-13, -38); ctx.lineTo(13, -38);
    ctx.moveTo(0, -58); ctx.lineTo(0, -28);
    ctx.stroke();
    // Overalls straps
    ctx.fillStyle = '#3a5a8c';
    ctx.fillRect(-9, -58, 4, 12);
    ctx.fillRect(5, -58, 4, 12);
    // Arms reaching forward (he wants that turkey)
    ctx.strokeStyle = '#e8b88a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(10, -52); ctx.lineTo(24, -44 + Math.sin(t * 6) * 2);
    ctx.moveTo(10, -46); ctx.lineTo(24, -38);
    ctx.stroke();
    // Head
    ctx.fillStyle = '#e8b88a';
    ctx.beginPath();
    ctx.arc(6, -68, 10, 0, Math.PI * 2);
    ctx.fill();
    // Angry eyebrows
    ctx.strokeStyle = '#4a2c14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -72); ctx.lineTo(9, -70);
    ctx.moveTo(16, -70); ctx.lineTo(10, -72);
    ctx.stroke();
    // Straw hat
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath();
    ctx.ellipse(6, -76, 17, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-3, -88, 18, 13);
    ctx.fillStyle = '#8a6a2a';
    ctx.fillRect(-3, -78, 18, 3);
    ctx.restore();
  }
}
