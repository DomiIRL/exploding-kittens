import type {Card} from '../models';

export class CardType {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  createCard(index: number): Card {
    return {name: this.name, index};
  }
}
