import {ICard} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";

export class Pile {
  constructor(private game: TheGame, public state: ICard[]) {
  }

  addCard(card: Card | ICard): void {
    const cardData: ICard = {name: card.name, index: card.index};

    // Clone to avoid Proxy issues
    this.state.push({...cardData});
  }

  get topCard(): Card | null {
    const iCard = this.state[this.state.length - 1];
    return this.state.length > 0 ? new Card(this.game, iCard) : null;
  }

  drawCard(): Card | null {
    const shift = this.state.shift();
    return shift ? new Card(this.game, shift) : null;
  }

  insertCard(card: ICard, index: number): void {
    const cardData: ICard = {name: card.name, index: card.index};
    // Clone to avoid Proxy issues
    this.state.splice(index, 0, {...cardData});
  }

  get size(): number {
    return this.state.length;
  }

  shuffle(): void {
    this.state = this.game.random.Shuffle(this.state);
  }
}

