import type {ICard} from './card.model';

export interface IPlayer {
  hand: ICard[];
  handSize: number;
  isAlive: boolean;
}
