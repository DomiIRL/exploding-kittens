import {ICard} from '../models';
import {Game} from "./game";

export class Piles {
  constructor(private game: Game) {}

  /**
   * Add a card to the discard pile
   */
  discardCard(card: ICard): void {
    // Clone to avoid Proxy issues
    this.game.context.G.discardPile.push({...card});
  }

  /**
   * Get the last discarded card
   */
  get lastDiscardedCard(): ICard | null {
    const pile = this.game.context.G.discardPile;
    return pile.length > 0 ? pile[pile.length - 1] : null;
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCardFromPile(): ICard | undefined {
    return this.game.context.G.drawPile.shift();
  }

  /**
   * Insert a card into the draw pile at a specific index
   */
  insertCardIntoDrawPile(card: ICard, index: number): void {
    // Clone to avoid Proxy issues
    this.game.context.G.drawPile.splice(index, 0, {...card});
  }

  /**
   * Get draw pile size
   */
  get drawPileSize(): number {
    return this.game.context.G.drawPile.length;
  }
}

