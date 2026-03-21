import {ICard, IPiles} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {Pile} from "./pile";

export class Piles {
  constructor(private game: TheGame, public cards: IPiles) {
  }

  get drawPile(): Pile {
    return new Pile(this.game, this.cards.drawPile);
  }

  get discardPile(): Pile {
    return new Pile(this.game, this.cards.discardPile);
  }

  /**
   * Add a card to the discard pile
   */
  discardCard(card: Card | ICard): void {
    this.discardPile.addCard(card);
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCard(): Card | null {
    return this.drawPile.drawCard();
  }
}

