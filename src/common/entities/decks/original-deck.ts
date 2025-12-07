import {Deck} from '../deck';
import type {Card} from '../../models';

import {
  ATTACK,
  CAT_CARD,
  DEFUSE,
  EXPLODING_KITTEN,
  FAVOR,
  NOPE,
  SEE_THE_FUTURE,
  SHUFFLE,
  SKIP,
} from '../../constants/card-types';

const STARTING_HAND_SIZE = 7;
const TOTAL_DEFUSE_CARDS = 6;
const MAX_DECK_DEFUSE_CARDS = 2;
const EXPLODING_KITTENS = 4;

export class OriginalDeck extends Deck {
  constructor() {
    super('original');
  }

  startingHandSize(): number {
    return STARTING_HAND_SIZE;
  }

  startingHandForcedCards(index: number): Card[] {
    return [DEFUSE.createCard(index)];
  }

  buildBaseDeck(): Card[] {
    const pile: Card[] = [];

    for (let i = 0; i < 4; i++) {
      pile.push(ATTACK.createCard(i));
      pile.push(SKIP.createCard(i));
      pile.push(SHUFFLE.createCard(i));
      pile.push(FAVOR.createCard(i));
      for (let j = 0; j < 5; j++) {
        pile.push(CAT_CARD.createCard(1));
      }
    }

    for (let i = 0; i < 5; i++) {
      pile.push(SEE_THE_FUTURE.createCard(i));
      pile.push(NOPE.createCard(i));
    }

    return pile;
  }

  addPostDealCards(pile: Card[], playerCount: number): void {
    const remaining = Math.min(TOTAL_DEFUSE_CARDS - playerCount, MAX_DECK_DEFUSE_CARDS);

    for (let i = 0; i < remaining; i++) {
      pile.push(DEFUSE.createCard(playerCount - 1 + i));
    }

    for (let i = 0; i < EXPLODING_KITTENS; i++) {
      pile.push(EXPLODING_KITTEN.createCard(i));
    }
  }
}
