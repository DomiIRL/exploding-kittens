import {ICard, IPiles} from '../models';
import {TheGame} from "./game";

export class Piles {
  constructor(private game: TheGame, public state: IPiles) {
  }

  /**
   * Add a card to the discard pile
   */
  discardCard(card: ICard): void {
    // Clone to avoid Proxy issues
    this.state.discardPile.push({...card});
  }

  /**
   * Get the last discarded card
   */
  get lastDiscardedCard(): ICard | null {
    const pile = this.state.discardPile;
    return pile.length > 0 ? pile[pile.length - 1] : null;
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCardFromPile(): ICard | undefined {
    return this.state.drawPile.shift();
  }

  /**
   * Insert a card into the draw pile at a specific index
   */
  insertCardIntoDrawPile(card: ICard, index: number): void {
    // Clone to avoid Proxy issues
    this.state.drawPile.splice(index, 0, {...card});
  }

  /**
   * Get draw pile size
   */
  get drawPileSize(): number {
    return this.state.drawPile.length;
  }

  shuffleDrawPile(): void {
    this.state.drawPile = this.game.random.Shuffle(this.state.drawPile);
  }
}

