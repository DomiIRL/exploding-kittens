import {Deck} from "../Deck";
import {ATTACK, SKIP, NOPE, CAT_HAIRY, CAT_MELON, CAT_TACO, CAT_BEARD, CAT_RAINBOW, FAVOR, DEFUSE, SHUFFLE, EXPLODING_KITTEN, SEE_THE_FUTURE} from "../cards";
import {Card} from "../Card";

const STARTING_HAND_SIZE = 7;
const TOTAL_DEFUSE_CARDS = 6;
const MAX_DECK_DEFUSE_CARDS = 2;

export class OriginalDeck extends Deck {

  constructor(name) {
    super(name);
  }

  create_pre_deck(deck) {

    for (let i = 0; i < 4; i++) {
      deck.push(new Card(ATTACK, i));
      deck.push(new Card(SKIP, i));
      deck.push(new Card(SHUFFLE, i));
      deck.push(new Card(FAVOR, 3));
      deck.push(new Card(CAT_BEARD, 3));
      deck.push(new Card(CAT_RAINBOW, 3));
      deck.push(new Card(CAT_TACO, 3));
      deck.push(new Card(CAT_MELON, 3));
    }
    for (let i = 0; i < 5; i++) {
      deck.push(new Card(SEE_THE_FUTURE, 3));
      deck.push(new Card(NOPE, 3));
    }

  }

  add_post_cards(deck, playerCount) {
    let remainingDefuse = Math.min(
        TOTAL_DEFUSE_CARDS - playerCount,
        MAX_DECK_DEFUSE_CARDS
    );
    for (let i = 0; i < remainingDefuse; i++) {
      deck.push(new Card());
    }

  }

}