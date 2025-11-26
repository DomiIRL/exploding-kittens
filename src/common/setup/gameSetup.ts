import { createNormalDeck, addSpecialCards } from './deckBuilder';
import { distributeInitialHands, PlayerStates } from './playerSetup';
import { Ctx } from 'boardgame.io';

export interface GameState {
  deck: string[];
  discardPile: string[];
}

/**
 * Main game setup function
 */
export const setupGame = (context: any): GameState => {
  const ctx = context.ctx as Ctx;
  const playerState = context.player?.state as PlayerStates;

  // Create and shuffle the initial deck
  let deck = createNormalDeck();

  // Distribute cards to players
  if (playerState) {
    deck = distributeInitialHands(deck, ctx.playOrder, playerState);
  }

  // Add special cards (defuse and exploding kittens) and shuffle
  deck = addSpecialCards(deck, ctx.playOrder.length);

  return {
    deck,
    discardPile: [],
  };
};

