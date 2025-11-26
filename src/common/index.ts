// Main game export
export { ExplodingKittens } from './game';

// Models
export * from './models';

// Entities
export type { CardType } from './entities/card-type';
export type { Deck } from './entities/deck';
export type { CatCard } from './entities/cards/cat-card';
export type { DefuseCard } from './entities/cards/defuse-card';
export type { ExplodingKittenCard } from './entities/cards/exploding-kitten-card';
export type { OriginalDeck } from './entities/decks/original-deck';

// Constants - Card types
export {
  ATTACK,
  SKIP,
  SHUFFLE,
  FAVOR,
  NOPE,
  SEE_THE_FUTURE,
  CAT_BEARD,
  CAT_RAINBOW,
  CAT_TACO,
  CAT_MELON,
  CAT_HAIRY,
  DEFUSE,
  EXPLODING_KITTEN,
} from './constants/card-types';

// Constants - Decks
export { ORIGINAL } from './constants/decks';

// Constants - Game config
export { GAME_CONFIG, turnConfig, moves } from './constants/game-config';

// Setup functions
export { setupGame } from './setup/game-setup';
export { createPlayerState, filterPlayerView, dealHands } from './setup/player-setup';

// Plugins
export { createPlayerPlugin } from './plugins/player-plugin';
