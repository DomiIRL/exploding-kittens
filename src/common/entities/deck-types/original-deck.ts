import {DeckType} from '../deck-type';
import type {ICard} from '../../models';
import {TheGame} from '../game';

import {
  ATTACK,
  CAT_CARD, DEFUSE,
  EXPLODING_KITTEN,
  FAVOR, NOPE,
  SEE_THE_FUTURE,
  SHUFFLE,
  SKIP,
} from '../../registries/card-registry';

const STARTING_HAND_SIZE = 7;
const TOTAL_DEFUSE_CARDS = 6;
const MAX_DECK_DEFUSE_CARDS = 2;

export class OriginalDeck extends DeckType {
  constructor() {
    super('original');
  }

  startingHandSize(): number {
    return STARTING_HAND_SIZE;
  }

  startingHandForcedCards(game: TheGame, index: number): ICard[] {
    return [DEFUSE.createCard(index, game)];
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    for (let i = 0; i < 4; i++) {
      drawPile.addCard(ATTACK.createCard(i, game));
      drawPile.addCard(SKIP.createCard(i, game));
      drawPile.addCard(SHUFFLE.createCard(i, game));
      drawPile.addCard(FAVOR.createCard(i, game));
      drawPile.addCard(NOPE.createCard(i, game));
      for (let j = 0; j < 5; j++) {
        drawPile.addCard(CAT_CARD.createCard(i, game));
      }
    }

    for (let i = 0; i < 5; i++) {
      drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const playerCount = game.players.playerCount;
    const remaining = Math.min(TOTAL_DEFUSE_CARDS - playerCount, MAX_DECK_DEFUSE_CARDS);
    const drawPile = game.piles.drawPile;

    for (let i = 0; i < remaining; i++) {
      const cardIndex = (playerCount + i) % TOTAL_DEFUSE_CARDS;
      drawPile.addCard(DEFUSE.createCard(cardIndex, game));
    }

    // add amount of players minus one exploding kitten
    for (let i = 0; i < playerCount - 1; i++) {
      // after index 3 restart at 0, since there are only 4 unique exploding kitten cards
      const cardIndex = i % 4;
      drawPile.addCard(EXPLODING_KITTEN.createCard(cardIndex, game));
    }
  }
}
