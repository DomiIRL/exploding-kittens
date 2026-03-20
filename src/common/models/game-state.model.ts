import type {Card} from './card.model';
import type {PlayerID} from 'boardgame.io';

export interface ClientGameState {
  drawPileLength: number;
}

export interface GameRules {
  spectatorsSeeCards: boolean;
  openCards: boolean;
  pendingTimerMs: number;
}

export interface PendingCardPlay {
  card: Card;
  playedBy: PlayerID;
  startedAtMs: number;
  expiresAtMs: number;
  lastNopeBy: PlayerID | null;
  nopeCount: number;
  isNoped: boolean;
}

export interface GameState {
  winner: PlayerID | null;
  drawPile: Card[];
  discardPile: Card[];
  pendingCardPlay: PendingCardPlay | null;
  turnsRemaining: number;
  gameRules: GameRules;
  deckType: string;
  client: ClientGameState;
  lobbyReady: boolean;
}
