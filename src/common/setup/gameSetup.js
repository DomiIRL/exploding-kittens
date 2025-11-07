import { createNormalDeck, addSpecialCards } from './deckBuilder.js';
import { distributeInitialHands } from './playerSetup.js';

/**
 * Main game setup function
 */
export const setupGame = ({ ctx, player }) => {
  // Create and shuffle the initial deck
  let deck = createNormalDeck();

  // Distribute cards to players
  deck = distributeInitialHands(deck, ctx.playOrder, player.state);

  // Add special cards (defuse and exploding kittens) and shuffle
  deck = addSpecialCards(deck, ctx.playOrder.length);

  return {
    deck,
    discardPile: [],
  };
};
