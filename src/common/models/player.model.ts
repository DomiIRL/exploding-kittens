import type { Card } from './card.model';

export interface Player {
  hand: Card[];
  hand_count: number;
  isAlive: boolean;
}
