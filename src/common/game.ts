import {Game} from 'boardgame.io';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame} from './setup/game-setup';
import type {ICard, IContext, IGameState, IPluginAPIs} from './models';
import {drawCard} from "./moves/draw-move";
import {playCard, resolvePendingCard} from "./moves/play-card-move";
import {requestCard, giveCard} from "./moves/favor-card-move";
import {closeFutureView} from "./moves/see-future-move";
import {inGame} from "./moves/in-game";
import {turnOrder} from "./utils/turn-order";
import {OriginalDeck} from './entities/deck-types/original-deck';
import {dealHands} from './setup/player-setup';
import {defuseExplodingKitten} from "./moves/defuse-exploding-kitten";
import {TheGame} from "./entities/game";
import {stealCard} from "./moves/steal-card-move";
import {GAME_OVER, PLAY} from "./constants/phases";
import {VIEWING_FUTURE, WAITING_FOR_START} from "./constants/stages";

export const ExplodingKittens: Game<IGameState, IPluginAPIs> = {
  name: "Exploding-Kittens",

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  disableUndo: true,

  playerView: ({G, ctx, playerID}) => {
    // The player plugin's playerView will handle filtering the player data
    // We need to pass G through so it's available

    let viewableDrawPile: ICard[] = [];

    if (ctx.activePlayers?.[playerID!] === VIEWING_FUTURE) {
      viewableDrawPile = G.piles.drawPile.cards.slice(0, 3);
    }

    return {
      ...G,
      drawPile: viewableDrawPile
    };
  },

  moves: {},

  phases: {
    lobby: {
      start: true,
      next: 'play',
      onEnd: (context: IContext) => {
        const game = new TheGame(context)

        // Initialize the hands and piles
        const deck = new OriginalDeck();
        const pile: ICard[] = deck.buildBaseDeck().sort(() => Math.random() - 0.5);

        dealHands(pile, game.context.player.state, deck); // TODO: use api wrapper
        deck.addPostDealCards(pile, Object.keys(game.context.ctx.playOrder).length); // TODO: use api wrapper

        game.piles.drawPile = pile;
        game.piles.drawPile.shuffle();
      },
      turn: {
        activePlayers: {
          all: WAITING_FOR_START,
        },
        stages: {
          waitingForStart: {
            moves: {
              startGame: {
                move: (context: IContext) => {
                  context.events.setPhase(PLAY);
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
                move: inGame(defuseExplodingKitten),
                client: false
              },
            }
          },
          choosePlayerToStealFrom: {
            moves: {
              stealCard: {
                move: inGame(stealCard),
                client: false
              },
            },
          },
          choosePlayerToRequestFrom: {
            moves: {
              requestCard: {
                move: inGame(requestCard),
                client: false
              },
            },
          },
          chooseCardToGive: {
            moves: {
              giveCard: inGame(giveCard),
            },
          },
          viewingFuture: {
            moves: {
              closeFutureView: inGame(closeFutureView),
            },
          },
          respondWithNowCard: {
            moves: {
              playCard: {
                move: inGame(playCard),
                client: false,
              },
            },
          },
          awaitingNowCards: {
            moves: {
              playCard: {
                move: inGame(playCard),
                client: false,
              },
              resolvePendingCard: {
                move: inGame(resolvePendingCard),
                client: false,
              },
            },
          },
        },
      },
      moves: {
        drawCard: {
          move: inGame(drawCard),
          client: false
        },
        playCard: {
          move: inGame(playCard),
          client: false
        }
      },
      endIf: ({player}) => {
        const alivePlayers = Object.entries(player.state).filter(
          ([_, p]) => p.isAlive
        );

        // End phase when only one player is alive
        if (alivePlayers.length === 1) {
          return {next: GAME_OVER};
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
    gameOver: {},
  },
};

