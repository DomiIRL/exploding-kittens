import {Ctx, Game} from 'boardgame.io';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame} from './setup/game-setup';
import type {ICard, IContext, IGameState, IPluginAPIs} from './models';
import {drawCard} from "./moves/draw-move";
import {playCard, playNowCard, resolvePendingCard} from "./moves/play-card-move";
import {stealCard} from "./moves/steal-card-move";
import {requestCard, giveCard} from "./moves/favor-card-move";
import {closeFutureView} from "./moves/see-future-move";
import {turnOrder} from "./utils/turn-order";
import {OriginalDeck} from './entities/deck-types/original-deck';
import {dealHands} from './setup/player-setup';
import {defuseExplodingKitten} from "./moves/defuse-exploding-kitten";

export const ExplodingKittens: Game<IGameState, IPluginAPIs> = {
  name: "Exploding-Kittens",

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  disableUndo: true,

  playerView: ({G, ctx, playerID}: {G: IGameState; ctx: Ctx; playerID: any}) => {
    // The player plugin's playerView will handle filtering the player data
    // We need to pass G through so it's available

    let viewableDrawPile: ICard[] = [];

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

  moves: {},

  phases: {
    lobby: {
      start: true,
      next: 'play',
      onBegin: ({G}: IContext) => {
        // Reset game state for lobby
        G.lobbyReady = false;
      },
      onEnd: ({G, ctx, player}) => {
        // Deal card-types when leaving lobby phase
        const deck = new OriginalDeck();
        const pile: ICard[] = deck.buildBaseDeck().sort(() => Math.random() - 0.5);

        dealHands(pile, player.state, deck);
        deck.addPostDealCards(pile, Object.keys(ctx.playOrder).length);

        G.drawPile = pile.sort(() => Math.random() - 0.5);
      },
      endIf: ({G}) => {
        // Move to play phase only when lobbyReady flag is explicitly set
        if (G.lobbyReady) {
          return {next: 'play'};
        }
      },
      turn: {
        activePlayers: {
          all: 'waitingForStart',
        },
        stages: {
          'waitingForStart': {
            moves: {
              startGame: {
                move: ({G}: IContext) => {
                  // Need to trust players since there is no api to see who is currently connected
                  // Only the client has that info exposed by boardgame.io for some reason
                  G.lobbyReady = true;
                },
                client: false,
              },
            }
          }
        },
        order: {
          first: () => 0,
          next: () => undefined,
        },
      },
    },
    play: {
      turn: {
        order: turnOrder,
        onEnd: ({G}: any) => {
          // Decrement the turns remaining counter
          G.turnsRemaining = G.turnsRemaining - 1;

          // If we're moving to the next player, reset the counter
          if (G.turnsRemaining <= 0) {
            G.turnsRemaining = 1;
          }
        },
        stages: {
          defuseExplodingKitten: {
            moves: {
              defuseExplodingKitten: {
                move: defuseExplodingKitten,
                client: false
              },
            }
          },
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
          respondWithNowCard: {
            moves: {
              playNowCard: {
                move: playNowCard,
                client: false,
              },
            },
          },
          awaitingNowCards: {
            moves: {
              playNowCard: {
                move: playNowCard,
                client: false,
              },
              resolvePendingCard: {
                move: resolvePendingCard,
                client: false,
              },
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
        }
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

