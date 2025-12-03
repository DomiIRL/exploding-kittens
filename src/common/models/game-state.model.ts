import type { Card } from './card.model';

export interface GameState {
  drawPile: Card[];
  discardPile: Card[];
}
