import type {Card} from './card.model';
import type {PlayerID} from 'boardgame.io';

export interface ClientGameState {
  drawPileLength: number;
}

export interface GameRules {
  spectatorsCardsHidden: boolean;
  openCards: boolean;
}

export interface GameState {
  winner: PlayerID | null;
  drawPile: Card[];
  discardPile: Card[];
  turnsRemaining: number;
  gameRules: GameRules;
  deckType: string;
  client: ClientGameState;
  lobbyReady: boolean;
}
