import {Game} from 'boardgame.io';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame} from './setup/game-setup';
import {GAME_CONFIG, moves, turnConfig} from './constants/game-config';
import type {GameState, PluginAPIs} from './models';

export const ExplodingKittens: Game<GameState, PluginAPIs> = {
  name: GAME_CONFIG.name,

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  phases: {
    play: {
      start: true,
      turn: turnConfig,
      moves: moves,
      endIf: ({player}) => {
        const alivePlayers = Object.entries(player.state).filter(
          ([_, p]) => p.isAlive
        );

        // End phase when only one player is alive
        if (alivePlayers.length === 1) {
          return {next: 'gameover'};
        }
      },
      onEnd: ({G, player}) => {
        // Find the last alive player
        const alivePlayers = Object.entries(player.state).filter(
          ([_, p]) => p.isAlive
        );

        if (alivePlayers.length === 1) {
          G.winner = alivePlayers[0][0];
        }
      },
    },
    gameover: {},
  },
};

