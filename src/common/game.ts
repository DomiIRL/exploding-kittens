import {Ctx, Game} from 'boardgame.io';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame} from './setup/game-setup';
import type {Card, GameState, PluginAPIs} from './models';
import {drawCard} from "./moves/draw-move";
import {playCard} from "./moves/play-card-move";
import {stealCard} from "./moves/steal-card-move";
import {requestCard, giveCard} from "./moves/favor-card-move";
import {closeFutureView} from "./moves/see-future-move";
import {skipDeadPlayers} from "./utils/turn-order";

export const ExplodingKittens: Game<GameState, PluginAPIs> = {
  name: "Exploding-Kittens",

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  playerView: ({G, ctx, playerID}: {G: GameState; ctx: Ctx; playerID: any}) => {
    // The player plugin's playerView will handle filtering the player data
    // We need to pass G through so it's available

    let viewableDrawPile: Card[] = [];

    if (ctx.activePlayers?.[playerID!] === 'viewingFuture') {
      viewableDrawPile = G.drawPile.slice(0, 3);
    }

    return {
      ...G,
      drawPile: viewableDrawPile,
      client: {
        drawPileLength: G.drawPile.length
      }
    };
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
              stealCard: {
                move: stealCard,
                client: false
              },
            },
          },
          choosePlayerToRequestFrom: {
            moves: {
              requestCard: {
                move: requestCard,
                client: false
              },
            },
          },
          chooseCardToGive: {
            moves: {
              giveCard: giveCard,
            },
          },
          viewingFuture: {
            moves: {
              closeFutureView: closeFutureView,
            },
          },
        },
      },
      moves: {
        drawCard: {
          move: drawCard,
          client: false
        },
        playCard: {
          move: playCard,
          client: false
        },
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

