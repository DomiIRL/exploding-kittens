import { Game } from 'boardgame.io';
import { createPlayerPlugin } from './plugins/playerPlugin';
import { setupGame } from './setup/gameSetup';
import { GAME_CONFIG, turnConfig, moves } from './config/gameConfig';
import {GameState} from "./data/GameState";
import {PluginAPIs} from "./data/PluginAPIs";

export const ExplodingKittens: Game<GameState, PluginAPIs> = {
  name: GAME_CONFIG.name,

  plugins: [
    createPlayerPlugin(),
  ],

  setup: setupGame,

  turn: turnConfig,

  moves: moves,
};

