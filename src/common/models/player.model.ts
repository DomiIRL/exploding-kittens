import type {Card} from './card.model';

export interface Player {
  hand: Card[];
  // On server this is always 0! Do not use anywhere else than on the client frontend for when player .
  hand_count: number;
  isAlive: boolean;
}
