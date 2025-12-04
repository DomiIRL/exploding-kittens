import type {Card, FnContext} from '../models';

export class CardType {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  createCard(index: number): Card {
    return {name: this.name, index};
  }

  canBePlayed(_context: FnContext, _card: Card): boolean {
    return true;
  }

  onPlayed(_context: FnContext, _card: Card): void {}

}
