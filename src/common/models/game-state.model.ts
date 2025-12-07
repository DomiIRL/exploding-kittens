import type {Card} from './card.model';
import type {PlayerID} from 'boardgame.io';

export interface GameRules {
  deadPlayersCanSeeAllCards: boolean;
  openCards: boolean;
}

export interface GameState {
  winner: PlayerID | null;
  drawPile: Card[];
  discardPile: Card[];
  turnsRemaining: number;
  gameRules: GameRules;
}
