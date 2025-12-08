import type {Card} from './card.model';

export interface ClientPlayer {
  handCount: number;
}

export interface Player {
  hand: Card[];
  // On server this is always 0! Do not use anywhere else than on the client frontend for when player .
  isAlive: boolean;
  client: ClientPlayer
}
