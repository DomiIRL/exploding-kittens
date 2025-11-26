import { Deck } from "../Deck";
import { Card } from "../CardType";
import {
  ATTACK,
  SKIP,
  NOPE,
  CAT_MELON,
  CAT_TACO,
  CAT_BEARD,
  CAT_RAINBOW,
  FAVOR,
  DEFUSE,
  SHUFFLE,
  SEE_THE_FUTURE
} from "../cards";

const STARTING_HAND_SIZE = 7;
const TOTAL_DEFUSE_CARDS = 6;
const MAX_DECK_DEFUSE_CARDS = 2;

export class OriginalDeck extends Deck {
  constructor(name: string) {
    super(name);
  }

  create_initial_deck(deck: Card[]): void {
    for (let i = 0; i < 4; i++) {
      deck.push(ATTACK.createCard(i));
      deck.push(SKIP.createCard(i));
      deck.push(SHUFFLE.createCard(i));
      deck.push(FAVOR.createCard(3));
      deck.push(CAT_BEARD.createCard(3));
      deck.push(CAT_RAINBOW.createCard(3));
      deck.push(CAT_TACO.createCard(3));
      deck.push(CAT_MELON.createCard(3));
    }
    for (let i = 0; i < 5; i++) {
      deck.push(SEE_THE_FUTURE.createCard(3));
      deck.push(NOPE.createCard(3));
    }
  }

  get_initial_hand_size(): number {
    return STARTING_HAND_SIZE;
  }

  add_post_cards(deck: Card[], playerCount: number): void {
    const remainingDefuse = Math.min(
      TOTAL_DEFUSE_CARDS - playerCount,
      MAX_DECK_DEFUSE_CARDS
    );
    for (let i = 0; i < remainingDefuse; i++) {
      deck.push(DEFUSE.createCard(i));
    }
  }
}

