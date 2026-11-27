// Gobble Dash — bootstrap: build the game on the canvas and start the loop.
// Exposes window.__gobble for play-testing (read-only handle to the live game).

import { Game } from './game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
window.__gobble = game;
game.start();
