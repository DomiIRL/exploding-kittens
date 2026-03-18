import {FnContext} from '../models/context.model';
import {Card} from '../models/card.model';

export class DeckLogic {
  constructor(private context: FnContext) {}

  /**
   * Add a card to the discard pile
   */
  discardCard(card: Card): void {
    // Clone to avoid Proxy issues
    this.context.G.discardPile.push({...card});
  }

  /**
   * Get the last discarded card
   */
  get lastDiscardedCard(): Card | null {
    const pile = this.context.G.discardPile;
    return pile.length > 0 ? pile[pile.length - 1] : null;
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCardFromPile(): Card | undefined {
    return this.context.G.drawPile.shift(); 
  }

  /**
   * Insert a card into the draw pile at a specific index
   */
  insertCardIntoDrawPile(card: Card, index: number): void {
    // Clone to avoid Proxy issues
    this.context.G.drawPile.splice(index, 0, {...card});
  }

  /**
   * Get draw pile size
   */
  get drawPileSize(): number {
    return this.context.G.drawPile.length;
  }
}

