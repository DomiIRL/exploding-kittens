import {Game} from 'boardgame.io';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame} from './setup/game-setup';
import type {GameState, PluginAPIs} from './models';
import {drawCard} from "./moves/draw-move";
import {playCard} from "./moves/play-card-move";
import {stealCard} from "./moves/steal-card-move";
import {skipDeadPlayers} from "./utils/turn-order";

export const ExplodingKittens: Game<GameState, PluginAPIs> = {
  name: "Exploding-Kittens",

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  playerView: ({G}) => {
    // The player plugin's playerView will handle filtering the player data
    // We need to pass G through so it's available
    return G;
  },

  phases: {
    play: {
      start: true,
      turn: {
        minMoves: 1,
        order: skipDeadPlayers,
        onEnd: ({G}: any) => {
          // Decrement the turns remaining counter
          G.turnsRemaining = G.turnsRemaining - 1;

          // If we're moving to the next player, reset the counter
          if (G.turnsRemaining <= 0) {
            G.turnsRemaining = 1;
          }
        },
        stages: {
          choosePlayerToStealFrom: {
            moves: {
              stealCard: stealCard,
            },
          },
        },
      },
      moves: {
        drawCard: drawCard,
        playCard: playCard,
      },
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

