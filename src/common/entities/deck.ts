import type {Card} from '../models';

export abstract class Deck {
  name: string;

  protected constructor(name: string) {
    this.name = name;
  }

  /** Cards that form the base deck before dealing */
  abstract buildBaseDeck(): Card[];

  /** How many cards each player starts with */
  abstract startingHandSize(): number;

  /** Cards automatically added to each player's hand */
  startingHandForcedCards(_player_index: number): Card[] {
    return [];
  }

  /** Extra cards added after the players are dealt */
  addPostDealCards(_pile: Card[], _playerCount: number): void {
  }
}

