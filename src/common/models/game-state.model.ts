import type { Card } from './card.model';
import type { PlayerID } from 'boardgame.io';

export interface GameState {
  winner: PlayerID | null;
  drawPile: Card[];
  discardPile: Card[];
  deadPlayersCanSeeAllCards: boolean;
}
