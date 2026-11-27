// Gobble Dash — stage layouts: where every fence, pumpkin, knife, oven,
// haystack, corn cob and golden feather sits. Built fresh per stage from a seed.

import { STAGES } from './config.js';
import { makeRng, range } from './random.js';
import {
  makePumpkin, makeFence, makeSwingKnife, makeFallingKnife, makeOven,
  makeSteam, makeHaystack, makeCorn, makeFeather,
} from './hazards.js';

export function buildStage(index) {
  const def = STAGES[index];
  const rng = makeRng(1234 + index * 777);
  const hazards = [];
  const pickups = [];
  const width = def.width;

  const cornLine = (x0, n, y) => {
    for (let i = 0; i < n; i++) pickups.push(makeCorn(x0 + i * 46, y));
  };

  if (index === 0) {
    // Farmyard: fences to jump, pumpkins rolling, haystacks to hide in.
    [420, 780, 1250, 1700, 2150].forEach((x) => hazards.push(makeFence(x)));
    hazards.push(makePumpkin(950), makePumpkin(1500), makePumpkin(2050));
    hazards.push(makeHaystack(600), makeHaystack(1400), makeHaystack(1980));
    cornLine(500, 4);
    cornLine(1000, 4);
    cornLine(1600, 5);
    cornLine(2250, 4);
    pickups.push(makeFeather(1350));
  } else if (index === 1) {
    // Barn: swinging knives over the floor, pitchfork traps, more hay.
    [520, 900, 1300, 1750, 2200].forEach((x) => hazards.push(makeSwingKnife(x, 80 + range(rng, 0, 30))));
    [700, 1150, 1600, 2050, 2400].forEach((x) => hazards.push(makeFence(x)));
    hazards.push(makePumpkin(1000), makePumpkin(1900));
    hazards.push(makeHaystack(650), makeHaystack(1500), makeHaystack(2300));
    cornLine(560, 4);
    cornLine(1200, 4);
    cornLine(1800, 5);
    cornLine(2350, 4);
    pickups.push(makeFeather(1450));
  } else {
    // Kitchen: ovens, falling knives, steam jets — and the back door.
    [560, 1100, 1650, 2100].forEach((x) => hazards.push(makeOven(x)));
    [800, 1350, 1900, 2300].forEach((x) => hazards.push(makeFallingKnife(x)));
    [950, 1500, 2050].forEach((x) => hazards.push(makeSteam(x)));
    hazards.push(makeFence(700), makeFence(1750));
    cornLine(600, 4);
    cornLine(1250, 4);
    cornLine(1800, 5);
    cornLine(2200, 4);
    pickups.push(makeFeather(1400));
  }

  return {
    def,
    index,
    width,
    hazards,
    pickups,
    exitX: width - 120,
    startX: 80,
  };
}
