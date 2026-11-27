// Gobble Dash — deterministic screenshot setups (?shot=...).
// Each one builds a real game state from the game's own code, runs the
// simulation a fixed number of steps with scripted input, then freezes the
// frame so the screenshot is a true render of live gameplay.
// NOTE: always grab game.turkey / game.farmer AFTER startRun/startStage,
// because those calls replace the objects.

import { GROUND_Y } from './config.js';
import { buildStage } from './stages.js';
import { updateHazard } from './hazards.js';

function scriptedInput(game, script) {
  let i = 0;
  return () => {
    const s = script[Math.min(i, script.length - 1)] || {};
    const prev = script[Math.max(0, i - 1)] || {};
    i += 1;
    return {
      left: !!s.left,
      right: !!s.right,
      sprint: !!s.sprint,
      jump: !!s.jump,
      jumpPressed: !!s.jump && !prev.jump,
      hidePressed: false,
      anyPressed: false,
    };
  };
}

function runSteps(game, n, nextInput) {
  const real = game.input;
  for (let k = 0; k < n; k++) {
    game.input = nextInput();
    game.update(1 / 60);
  }
  game.input = real;
}

function frameCamera(game) {
  game.camX = Math.max(0, Math.min(game.stage.width - 960, game.turkey.x - 960 * 0.38));
}

export function setupShot(game, name) {
  if (name === 'title') {
    game.state = 'title';
    game.frozen = true;
    return;
  }

  if (name === 'play') {
    // Cover shot: mid-chase in the farmyard — turkey mid-jump over a fence,
    // farmer right behind, corn ahead, pumpkin rolling in.
    game.startRun();
    const t = game.turkey;
    const f = game.farmer;
    t.reset(640);
    f.reset(480);
    f.state = 'chase';
    f.grace = 0;
    const script = [];
    for (let i = 0; i < 150; i++) {
      script.push({ right: true, sprint: i > 40, jump: i === 60 || i === 118 });
    }
    runSteps(game, 150, scriptedInput(game, script));
    // Stage the chase close: the farmer is the drama, keep him in frame.
    f.x = t.x - 130;
    f.state = 'chase';
    f.grace = 0;
    game.stageTimer = 5; // hide the hint bar for a clean frame
    frameCamera(game);
    game.frozen = true;
    return;
  }

  if (name === 'kitchen') {
    // Stage 3 in full swing: oven bursting, a knife mid-fall, steam jetting,
    // farmer closing in — turkey unhurt and clearly visible mid-run.
    game.startRun();
    game.startStage(2);
    const t = game.turkey;
    const f = game.farmer;
    game.score = 1840;
    t.reset(1420);
    f.reset(1240);
    f.state = 'chase';
    f.grace = 0;
    const script = [];
    for (let i = 0; i < 60; i++) script.push({ right: true, sprint: true });
    runSteps(game, 60, scriptedInput(game, script));
    // Settle the turkey on open ground, clear of every hazard, mid-stride.
    t.x = 1560;
    t.y = GROUND_Y;
    t.vy = 0;
    t.onGround = true;
    t.invulnerable = 0;
    t.lives = 2;
    t.corn = 14;
    t.runCycle = 2.1;
    f.x = 1400;
    f.state = 'chase';
    f.grace = 0;
    // Force the set pieces to fire at the frozen moment: the oven at 1650
    // bursts, the steam at 1500 jets, a knife falls at 1900.
    for (const h of game.stage.hazards) {
      if (h.kind === 'oven' && Math.abs(h.x - 1650) < 5) h.phase = 3.2 - (game.time % 3.2);
      if (h.kind === 'steam' && Math.abs(h.x - 1500) < 5) h.phase = 2.6 - (game.time % 2.6);
      if (h.kind === 'fallKnife' && Math.abs(h.x - 1900) < 5) {
        h.y = 200; h.vy = 420; h.timer = 0; h.stuck = 0;
      }
    }
    // Recompute the hazard states from the forced phases at the frozen time.
    for (const h of game.stage.hazards) updateHazard(h, 0, game.time);
    game.stageTimer = 5;
    frameCamera(game);
    game.frozen = true;
    return;
  }

  if (name === 'caught') {
    game.startRun();
    const t = game.turkey;
    const f = game.farmer;
    game.score = 960;
    t.corn = 8;
    t.lives = 0;
    f.x = t.x + 36;
    f.state = 'chase';
    f.grace = 0;
    game.state = 'caught';
    game.best = 960;
    game.frozen = true;
    return;
  }

  if (name === 'escaped') {
    game.startRun();
    const t = game.turkey;
    game.score = 3420;
    t.corn = 21;
    t.lives = 2;
    game.runTime = 187.4;
    game.state = 'escaped';
    game.best = 3420;
    game.frozen = true;
  }
}
