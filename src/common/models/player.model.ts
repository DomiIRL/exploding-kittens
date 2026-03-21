import type {ICard} from './card.model';

export interface IClientPlayer {
  handCount: number;
}

export interface IPlayer {
  hand: ICard[];
  // On server this is always 0! Do not use anywhere else than on the client frontend for when player .
  isAlive: boolean;
  client: IClientPlayer
}
