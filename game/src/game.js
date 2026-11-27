// Gobble Dash — the game itself: state machine, loop, collisions, scoring.
// States: title → playing → caught | escaped, plus paused.

import { VIEW_W, VIEW_H, GROUND_Y, SCORE, STAGES } from './config.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { buildStage } from './stages.js';
import { updateHazard, hazardTouch, drawHazard } from './hazards.js';
import {
  drawBackground, drawExitDoor, drawHud, drawTitle, drawEnd, drawPaused,
} from './render.js';
import { setupShot } from './shots.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.farmer.reset(-80); // strolls in from off-screen; 2s grace before he can catch
    this.state = 'title'; // title | playing | caught | escaped
    this.paused = false;
    this.frozen = false; // screenshot mode: render once, never update
    this.time = 0;
    this.runTime = 0;
    this.score = 0;
    this.best = 0;
    this.stageIndex = 0;
    this.stage = buildStage(0);
    this.stageTimer = 0;
    this.camX = 0;
    this.maxX = 80;
    this.distAcc = 0;
    this._raf = 0;
    this._last = 0;
    this._shotApplied = false;

    const params = new URLSearchParams(window.location.search);
    this.shot = params.get('shot');
    canvas.addEventListener('mousedown', () => this._click());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') this.sounds.toggleMute();
      if (e.key === 'p' || e.key === 'P') {
        if (this.state === 'playing') this.paused = !this.paused;
      }
      if ((e.key === 'r' || e.key === 'R') && (this.state === 'caught' || this.state === 'escaped')) {
        this.startRun();
      }
      if (e.key === 'Enter' && this.state === 'title') this.startRun();
    });
  }

  _click() {
    this.sounds.unlock();
    if (this.state === 'title') this.startRun();
    else if (this.state === 'caught' || this.state === 'escaped') this.startRun();
  }

  startRun() {
    this.stageIndex = 0;
    this.stage = buildStage(0);
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.farmer.reset(-80); // strolls in from off-screen; 2s grace before he can catch
    this.score = 0;
    this.runTime = 0;
    this.maxX = 80;
    this.camX = 0;
    this.stageTimer = 0;
    this.state = 'playing';
    this.paused = false;
    this.sounds.gobble();
  }

  startStage(index) {
    this.stageIndex = index;
    this.stage = buildStage(index);
    this.turkey.reset(this.stage.startX);
    this.farmer.reset(Math.max(-120, this.stage.startX - 260));
    this.maxX = this.stage.startX;
    this.camX = 0;
    this.stageTimer = 0;
    this.sounds.stageClear();
  }

  start() {
    const loop = (now) => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this._last) / 1000 || 0.016);
      this._last = now;
      if (!this.frozen) this.update(dt);
      this.render();
      this.input.endFrame();
    };
    this._raf = requestAnimationFrame(loop);
  }

  update(dt) {
    this.time += dt;
    // Screenshot setups run once, right after the first frame.
    if (this.shot && !this._shotApplied) {
      this._shotApplied = true;
      setupShot(this, this.shot);
      return;
    }
    if (this.state === 'title') {
      if (this.input.anyPressed) this.sounds.unlock();
      return;
    }
    if (this.state !== 'playing' || this.paused) return;
    this.runTime += dt;
    this.stageTimer += dt;
    const t = this.turkey;
    const f = this.farmer;

    t.update(dt, this.input, this.sounds);
    t.x = Math.max(20, Math.min(this.stage.width - 40, t.x));

    // Hiding: press H beside a haystack to vanish for a few seconds.
    if (this.input.hidePressed && !t.hidden) {
      const hay = this.stage.hazards.find((h) => h.kind === 'haystack' && Math.abs(h.x - t.x) < 60);
      if (hay && t.onGround) {
        t.hidden = true;
        t.hideTimer = 4;
        t.x = hay.x;
        this.sounds.gobble();
      }
    }

    // Farmer: catch = game over.
    if (f.update(dt, t, this.stage.width)) {
      this.state = 'caught';
      this.sounds.caught();
      this.best = Math.max(this.best, this.score);
      return;
    }
    if (f.state === 'chase' && Math.abs(f.x - t.x) < 260) this.sounds.alarm(this.time);

    // Hazards and pickups.
    for (const h of this.stage.hazards) {
      updateHazard(h, dt, this.time);
      if (t.invulnerable <= 0 && !t.hidden) {
        const touch = hazardTouch(h, t);
        if (touch === 'hurt') {
          t.lives -= 1;
          t.hurt();
          this.sounds.hurt();
          if (t.lives <= 0) {
            this.state = 'caught';
            this.sounds.caught();
            this.best = Math.max(this.best, this.score);
            return;
          }
        } else if (touch === 'stumble' && t.stumble <= 0 && Math.abs(t.vx) > 120) {
          t.stumble = 0.45;
          this.sounds.stumble();
        }
      }
    }
    for (const p of this.stage.pickups) {
      if (p.taken) continue;
      if (Math.abs(p.x - t.x) < 30 && Math.abs(p.y - (t.y - 20)) < 44) {
        p.taken = true;
        if (p.kind === 'corn') {
          t.corn += 1;
          this.score += SCORE.corn;
          this.sounds.corn();
        } else {
          if (t.lives < 3) t.lives += 1;
          this.score += SCORE.feather;
          this.sounds.feather();
        }
      }
    }

    // Distance score: only forward progress counts (fractional, so slow
    // frames still bank their points instead of flooring to zero).
    if (t.x > this.maxX) {
      this.distAcc += t.x - this.maxX;
      this.maxX = t.x;
      const pts = Math.floor(this.distAcc / SCORE.distancePerPoint);
      if (pts > 0) {
        this.score += pts;
        this.distAcc -= pts * SCORE.distancePerPoint;
      }
    }

    // Reached the exit?
    if (t.x >= this.stage.exitX) {
      this.score += SCORE.stageClear;
      if (this.stageIndex >= STAGES.length - 1) {
        this.state = 'escaped';
        this.score += Math.max(0, Math.floor((240 - this.runTime) * SCORE.escapeTimeBonusPerSecond));
        this.sounds.escaped();
        this.best = Math.max(this.best, this.score);
      } else {
        this.startStage(this.stageIndex + 1);
      }
    }

    // Camera follows the turkey, clamped to the stage.
    this.camX = Math.max(0, Math.min(this.stage.width - VIEW_W, t.x - VIEW_W * 0.38));
  }

  render() {
    const ctx = this.ctx;
    drawBackground(ctx, this.stage, this.camX, this.time);
    for (const h of this.stage.hazards) drawHazard(ctx, h, this.camX, this.time);
    drawExitDoor(ctx, this.stage, this.camX, this.time);
    this.farmer.draw(ctx, this.camX, this.time);
    this.turkey.draw(ctx, this.camX, this.time);
    if (this.state === 'playing') drawHud(ctx, this);
    else if (this.state === 'title') drawTitle(ctx, this);
    else if (this.state === 'caught' || this.state === 'escaped') drawEnd(ctx, this);
    if (this.paused && this.state === 'playing') drawPaused(ctx);
  }
}
