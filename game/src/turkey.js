// Gobble Dash — Giblet the turkey: run, jump, double-flap, sprint, hide.

import { GROUND_Y, PHYSICS } from './config.js';

export class Turkey {
  constructor() {
    this.reset(80);
    this.lives = 3;
    this.corn = 0;
    this.hidden = false;
    this.hideTimer = 0;
  }

  reset(x) {
    this.x = x;
    this.y = GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.facing = 1;
    this.flaps = 0; // jumps used since touching ground
    this.stumble = 0;
    this.invulnerable = 0;
    this.runCycle = 0;
    this.hidden = false;
    this.hideTimer = 0;
  }

  get w() { return 44; }
  get h() { return 46; }

  update(dt, input, sounds) {
    if (this.stumble > 0) this.stumble -= dt;
    if (this.invulnerable > 0) this.invulnerable -= dt;
    if (this.hideTimer > 0) {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0) this.hidden = false;
    }
    if (this.hidden) {
      this.vx = 0;
      return; // tucked in the haystack: perfectly still, perfectly safe
    }

    const speed = input.sprint ? PHYSICS.sprintSpeed : PHYSICS.runSpeed;
    let dir = 0;
    if (input.left) dir -= 1;
    if (input.right) dir += 1;
    const target = this.stumble > 0 ? 0 : dir * speed;
    this.vx += (target - this.vx) * Math.min(1, dt * 12);
    if (dir !== 0) this.facing = dir;

    if (input.jumpPressed) {
      if (this.onGround) {
        this.vy = PHYSICS.jumpVelocity;
        this.onGround = false;
        this.flaps = 1;
        sounds.jump();
      } else if (this.flaps < 2) {
        // The second flap: a turkey can fly, briefly, when it really wants to.
        this.vy = PHYSICS.flapVelocity;
        this.flaps = 2;
        sounds.flap();
      }
    }
    this.vy = Math.min(this.vy + PHYSICS.gravity * dt, PHYSICS.maxFall);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
      this.flaps = 0;
    }
    this.runCycle += Math.abs(this.vx) * dt * 0.045;
  }

  hurt() {
    this.invulnerable = PHYSICS.invulnerableTime;
    this.vx = -this.facing * 160;
    this.vy = -260;
    this.onGround = false;
  }

  draw(ctx, camX, t) {
    const sx = this.x - camX;
    const sy = this.y;
    if (this.hidden) return; // haystack covers the turkey entirely
    if (this.invulnerable > 0 && Math.floor(t * 14) % 2 === 0) return; // blink while invulnerable
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(this.facing, 1);
    const bob = this.onGround ? Math.sin(this.runCycle * 2) * 2 : 0;
    const legSwing = this.onGround ? Math.sin(this.runCycle * 2) * 7 : 4;
    // Tail fan
    ctx.fillStyle = '#6b3a1f';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate((i * 0.32) - Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -26, 7, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#c98d4e';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate((i * 0.32) - Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -24, 4, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Legs
    ctx.strokeStyle = '#e8a13c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, -8); ctx.lineTo(-6 + legSwing, 0);
    ctx.moveTo(6, -8); ctx.lineTo(6 - legSwing, 0);
    ctx.stroke();
    // Body
    ctx.fillStyle = '#7a4a22';
    ctx.beginPath();
    ctx.ellipse(0, -22 + bob, 20, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8d5a2b';
    ctx.beginPath();
    ctx.ellipse(0, -18 + bob, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wing (flaps when airborne)
    const wingAngle = this.onGround ? -0.4 + Math.sin(this.runCycle * 2) * 0.15 : -1.1;
    ctx.save();
    ctx.translate(-2, -24 + bob);
    ctx.rotate(wingAngle);
    ctx.fillStyle = '#5d3416';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Head + beak + wattle
    ctx.fillStyle = '#7a4a22';
    ctx.beginPath();
    ctx.arc(16, -42 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a13c';
    ctx.beginPath();
    ctx.moveTo(23, -44 + bob); ctx.lineTo(33, -40 + bob); ctx.lineTo(23, -38 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d9382b';
    ctx.beginPath();
    ctx.ellipse(24, -34 + bob, 3, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(18, -45 + bob, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
