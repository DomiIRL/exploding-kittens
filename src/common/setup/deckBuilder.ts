import { ORIGINAL_DECK, SPECIAL_CARDS, GAME_CONSTANTS } from '../data/Deck';

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  shuffled.sort(() => Math.random() - 0.5);
  return shuffled;
};

/**
 * Creates the initial deck with normal cards
 */
export const createNormalDeck = (): string[] => {
  const deck: string[] = [];

  ORIGINAL_DECK.forEach((card) => {
    for (let i = 0; i < card.count; i++) {
      deck.push(card.name);
    }
  });

  return shuffleArray(deck);
};

/**
 * Adds special cards (defuse and exploding kittens) to the deck
 */
export const addSpecialCards = (deck: string[], playerCount: number): string[] => {
  const modifiedDeck = [...deck];

  // Add remaining defuse cards (total 6, minus those given to players, max 2 extra)
  const remainingDefuse = Math.min(
    GAME_CONSTANTS.TOTAL_DEFUSE_CARDS - playerCount,
    GAME_CONSTANTS.MAX_DECK_DEFUSE_CARDS
  );
  for (let i = 0; i < remainingDefuse; i++) {
    modifiedDeck.push(SPECIAL_CARDS.DEFUSE);
  }

  // Add exploding kittens (one less than player count)
  const explodingKittens = playerCount - 1;
  for (let i = 0; i < explodingKittens; i++) {
    modifiedDeck.push(SPECIAL_CARDS.EXPLODING_KITTEN);
  }

  return shuffleArray(modifiedDeck);
};

