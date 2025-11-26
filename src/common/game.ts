import { Game } from 'boardgame.io';
import { createPlayerPlugin } from './plugins/player-plugin';
import { setupGame } from './setup/game-setup';
import { GAME_CONFIG, turnConfig, moves } from './constants/game-config';
import type { GameState, PluginAPIs } from './models';

export const ExplodingKittens: Game<GameState, PluginAPIs> = {
  name: GAME_CONFIG.name,

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  turn: turnConfig,

  moves: moves,
};

