// main.js — Bootstrap. Game class in core/game.js does the rest.
import { Game } from './core/game.js';

const canvas = document.getElementById('game');
new Game(canvas);
