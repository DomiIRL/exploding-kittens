import { Ctx } from 'boardgame.io';
import type { GameState, PlayerAPI, Card } from '../models';
import { OriginalDeck } from '../entities/decks/original-deck';
import { dealHands } from './player-setup';

export const setupGame = ({ ctx, player }: { ctx: Ctx; player: PlayerAPI }): GameState => {
  const deck = new OriginalDeck();

  const pile: Card[] = shuffle(deck.buildBaseDeck());

  dealHands(pile, player.state, deck);

  deck.addPostDealCards(pile, Object.keys(ctx.playOrder).length);

  return {
    winner: null,
    drawPile: shuffle(pile),
    discardPile: [],
  };
};

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

