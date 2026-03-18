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

  isNowCard(_context: FnContext, _card: Card): boolean {
    return false;
  }

  afterPlay(_context: FnContext, _card: Card): void {}

  onPlayed(_context: FnContext, _card: Card): void {}

  /**
   * Returns the sort order for this card type.
   */
  sortOrder(): number {
    return 100;
  }

}
