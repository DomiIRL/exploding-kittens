import type {ICard} from '../models';

export abstract class DeckType {
  name: string;

  protected constructor(name: string) {
    this.name = name;
  }

  /** Cards that form the base deck before dealing */
  abstract buildBaseDeck(): ICard[];

  /** How many card-types each player starts with */
  abstract startingHandSize(): number;

  /** Cards automatically added to each player's hand */
  startingHandForcedCards(_player_index: number): ICard[] {
    return [];
  }

  /** Extra card-types added after the players are dealt */
  addPostDealCards(_pile: ICard[], _playerCount: number): void {
  }
}

