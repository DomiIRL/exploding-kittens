import {ICard, IPile} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";

export class Pile {
  public cards: ICard[];

  constructor(public readonly name: string, private game: TheGame, public state: IPile) {
    this.cards = state.cards;
  }

  get allCards(): Card[] {
    return this.cards.map(iCard => new Card(this.game, iCard));
  }

  addCard(card: Card | ICard): void {
    const cardData: ICard = {name: card.name, index: card.index};

    // Clone to avoid Proxy issues
    this.cards.push({...cardData});
    this.updateSize();
  }

  get topCard(): Card | null {
    const iCard = this.cards[this.cards.length - 1];
    return this.cards.length > 0 ? new Card(this.game, iCard) : null;
  }

  peek(amount: number): Card[] {
    const peekedCards = this.cards.slice(0, amount);
    return peekedCards.map(iCard => new Card(this.game, iCard));
  }

  drawCard(): Card | null {
    const shift = this.cards.shift();
    this.updateSize();
    return shift ? new Card(this.game, shift) : null;
  }

  insertCard(card: ICard, index: number): void {
    const cardData: ICard = {name: card.name, index: card.index};
    // Clone to avoid Proxy issues
    this.cards.splice(index, 0, {...cardData});
    this.updateSize();
  }

  get size(): number {
    return this.state.size;
  }

  shuffle(): void {
    this.state.cards = this.game.random.Shuffle(this.cards);
  }

  private updateSize(): void {
    this.state.size = this.cards.length;
  }
}

