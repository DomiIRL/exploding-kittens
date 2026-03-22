import {ICard} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";

export class Pile {
  constructor(private game: TheGame, public cards: ICard[]) {
  }

  addCard(card: Card | ICard): void {
    const cardData: ICard = {name: card.name, index: card.index};

    // Clone to avoid Proxy issues
    this.cards.push({...cardData});
  }

  get topCard(): Card | null {
    const iCard = this.cards[this.cards.length - 1];
    return this.cards.length > 0 ? new Card(this.game, iCard) : null;
  }

  drawCard(): Card | null {
    const shift = this.cards.shift();
    return shift ? new Card(this.game, shift) : null;
  }

  insertCard(card: ICard, index: number): void {
    const cardData: ICard = {name: card.name, index: card.index};
    // Clone to avoid Proxy issues
    this.cards.splice(index, 0, {...cardData});
  }

  get size(): number {
    return this.cards.length;
  }

  shuffle(): void {
    this.cards = this.game.random.Shuffle(this.cards);
  }
}

