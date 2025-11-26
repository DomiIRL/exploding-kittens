import { Game } from 'boardgame.io';
import { createPlayerPlugin } from './plugins/playerPlugin';
import { setupGame, GameState } from './setup/gameSetup';
import { GAME_CONFIG, turnConfig, moves } from './config/gameConfig';

export const ExplodingKittens: Game<GameState> = {
  name: GAME_CONFIG.name,

  plugins: [
    createPlayerPlugin(),
  ],

  setup: setupGame,

  turn: turnConfig,

  moves: moves,
};

