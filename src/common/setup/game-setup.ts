import {Ctx} from 'boardgame.io';
import type {Card, GameState, PlayerAPI} from '../models';
import {OriginalDeck} from '../entities/decks/original-deck';
import {dealHands} from './player-setup';

export const setupGame = ({ctx, player}: { ctx: Ctx; player: PlayerAPI }): GameState => {
  const deck = new OriginalDeck();

  const pile: Card[] = shuffle(deck.buildBaseDeck());

  dealHands(pile, player.state, deck);

  deck.addPostDealCards(pile, Object.keys(ctx.playOrder).length);

  return {
    winner: null,
    drawPile: shuffle(pile),
    discardPile: [],
    turnsRemaining: 1,
    gameRules: {
      deadPlayersCanSeeAllCards: false,
      openCards: false,
    },
    client: {
      drawPileLength: 0
    }
  };
};

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

