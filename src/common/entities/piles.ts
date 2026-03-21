import {ICard, IPiles} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";

export class Piles {
  constructor(private game: TheGame, public state: IPiles) {
  }

  /**
   * Add a card to the discard pile
   */
  discardCard(card: Card | ICard): void {
    const cardData: ICard = {name: card.name, index: card.index};

    // Clone to avoid Proxy issues
    this.state.discardPile.push({...cardData});
  }

  /**
   * Get the last discarded card
   */
  get lastDiscardedCard(): Card | null {
    const pile = this.state.discardPile;
    const iCard = pile[pile.length - 1];
    return pile.length > 0 ? new Card(this.game, iCard) : null;
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCardFromPile(): Card | null {
    const shift = this.state.drawPile.shift();
    return shift ? new Card(this.game, shift) : null;
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

