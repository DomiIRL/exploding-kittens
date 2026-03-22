import {DeckType} from '../deck-type';
import type {ICard} from '../../models';

import {
  ATTACK,
  CAT_CARD,
  EXPLODING_KITTEN,
  FAVOR, NOPE,
  SEE_THE_FUTURE,
  SHUFFLE,
  SKIP,
} from '../../registries/card-registry';

const STARTING_HAND_SIZE = 7;
const TOTAL_DEFUSE_CARDS = 6;
const MAX_DECK_DEFUSE_CARDS = 2;
const EXPLODING_KITTENS = 4;

export class OriginalDeck extends DeckType {
  constructor() {
    super('original');
  }

  startingHandSize(): number {
    return STARTING_HAND_SIZE;
  }

  startingHandForcedCards(_index: number): ICard[] {
    return [];
  }

  buildBaseDeck(): ICard[] {
    const pile: ICard[] = [];

    for (let i = 0; i < 4; i++) {
      pile.push(ATTACK.createCard(i));
      pile.push(SKIP.createCard(i));
      pile.push(SHUFFLE.createCard(i));
      pile.push(FAVOR.createCard(i));
      pile.push(NOPE.createCard(i));
      for (let j = 0; j < 5; j++) {
        pile.push(CAT_CARD.createCard(i));
      }
    }

    for (let i = 0; i < 5; i++) {
      pile.push(SEE_THE_FUTURE.createCard(i));
    }

    return pile;
  }

  addPostDealCards(pile: ICard[], playerCount: number): void {
    const remaining = Math.min(TOTAL_DEFUSE_CARDS - playerCount, MAX_DECK_DEFUSE_CARDS);

    for (let i = 0; i < remaining; i++) {
      // pile.push(DEFUSE.createCard(playerCount - 1 + i));
    }

    for (let i = 0; i < EXPLODING_KITTENS; i++) {
      pile.push(EXPLODING_KITTEN.createCard(i));
    }
  }
}
