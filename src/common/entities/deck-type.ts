import type {ICard} from '../models';
import {TheGame} from './game';

export abstract class DeckType {
  name: string;

  protected constructor(name: string) {
    this.name = name;
  }

  /** Cards that form the base deck before dealing */
  abstract buildBaseDeck(game: TheGame): void;

  /** How many card-types each player starts with */
  abstract startingHandSize(): number;

  /** Cards automatically added to each player's hand */
  startingHandForcedCards(_game: TheGame, _player_index: number): ICard[] {
    return [];
  }

  /** Extra card-types added after the players are dealt */
  addPostDealCards(_game: TheGame): void {
  }
}
