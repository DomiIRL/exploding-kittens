import { createPlayerPlugin } from './plugins/playerPlugin.js';
import { setupGame } from './setup/gameSetup.js';
import { GAME_CONFIG, turnConfig, moves } from './config/gameConfig.js';

export const ExplodingKittens = {
  name: GAME_CONFIG.name,

  plugins: [
    createPlayerPlugin(),
  ],

  setup: setupGame,

  turn: turnConfig,

  moves: moves,
};
