// Gobble Dash — configuration: canvas, physics, stages, scoring.
// One place for every number the game tunes by.

export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 452; // top of the ground strip in world coords

export const PHYSICS = {
  gravity: 1500,
  runSpeed: 245,
  sprintSpeed: 330,
  jumpVelocity: -560,
  flapVelocity: -480,
  maxFall: 720,
  stumbleTime: 0.45,
  invulnerableTime: 1.4,
};

export const SCORE = {
  corn: 50,
  feather: 250,
  stageClear: 500,
  distancePerPoint: 12, // 1 point per 12px travelled
  escapeTimeBonusPerSecond: 25,
};

export const STAGES = [
  {
    key: 'farmyard',
    name: 'STAGE 1 — THE FARMYARD',
    width: 2600,
    sky: ['#ffd98a', '#f2a65a'],
    ground: '#8a5a2b',
    grass: '#7fae4c',
    hint: 'Run right! Jump the fences, grab the corn, and do NOT let the farmer catch you.',
  },
  {
    key: 'barn',
    name: 'STAGE 2 — THE BARN',
    width: 2800,
    sky: ['#c98d4e', '#8a5a34'],
    ground: '#6e4520',
    grass: '#c9a35a',
    hint: 'Haystacks hide you — press H beside one. Mind the swinging knives!',
  },
  {
    key: 'kitchen',
    name: 'STAGE 3 — THE KITCHEN',
    width: 2600,
    sky: ['#e8b48a', '#c97e4e'],
    ground: '#5a3a28',
    grass: '#d8cfc0',
    hint: 'The oven is hot and the knives fall from above. Reach the back door!',
  },
];

export const FARMER = {
  patrolSpeed: 62,
  chaseSpeed: 238,
  catchUpSpeed: 300,
  spotRange: 330,
  catchDistance: 30,
  searchTime: 3.0,
};
