import {Game} from 'boardgame.io';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame} from './setup/game-setup';
import type {IContext, IGameState, IPluginAPIs} from './models';
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
import {EXPLODING_KITTEN} from "./registries/card-registry";

export const ExplodingKittens: Game<IGameState, IPluginAPIs> = {
  name: "Exploding-Kittens",

  plugins: [createPlayerPlugin()],

  setup: setupGame,

  disableUndo: true,

  playerView: ({ G, ctx, playerID }) => {
    const isSpectator = playerID == null;
    const canSeeCards = isSpectator && G.gameRules?.spectatorsSeeCards;
    const isViewingFuture = !isSpectator && ctx.activePlayers?.[playerID] === VIEWING_FUTURE;
    const drawPileCards = G.piles?.drawPile?.cards ?? [];

    const animationsQueue = { ...G.animationsQueue };
    if (!G.gameRules?.openCards) {
      for (const timeKey in animationsQueue) {
        animationsQueue[timeKey] = animationsQueue[timeKey].map(anim => {
          const isGloballyVisible = anim.visibleTo.length == 0;
          const isVisible = playerID != null && anim.visibleTo?.includes(playerID);

          if (!canSeeCards && !isGloballyVisible && !isVisible) {
            return { ...anim, card: null };
          }
          return anim;
        });
      }
    }

    return {
      ...G,
      piles: {
        ...G.piles,
        drawPile: {
          ...(G.piles?.drawPile ?? {}),
          cards: isViewingFuture ? drawPileCards.slice(0, 3) : [],
        },
      },
      animationsQueue
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
        
        deck.buildBaseDeck(game);
        game.piles.drawPile.shuffle();

        dealHands(game, deck);
        deck.addPostDealCards(game);

        game.piles.drawPile.shuffle();
        game.piles.drawPile.insertCard(EXPLODING_KITTEN.createCard(0, game), 0)
        game.piles.drawPile.insertCard(EXPLODING_KITTEN.createCard(0, game), -1)
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
        onEnd: (context: IContext) => {
          const game = new TheGame(context);

          // Decrement the turns remaining counter
          game.turnManager.turnsRemaining = game.turnManager.turnsRemaining - 1;

          // If we're moving to the next player, reset the counter
          if (game.turnManager.turnsRemaining <= 0) {
            game.turnManager.turnsRemaining = 1;
          }
        },
        stages: {
          defuseExplodingKitten: {
            moves: {
              defuseExplodingKitten: {
                move: inGame(defuseExplodingKitten),
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
      onEnd: (context: IContext) => {
        const game = new TheGame(context);

        // Find the last alive player
        const players = game.players.alivePlayers;
        if (players.length === 1) {
          game.players.winner = players[0];
        }
      },
    },
    gameOver: {},
  },
};
