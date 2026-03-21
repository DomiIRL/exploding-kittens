import type {ICard} from './card.model';
import type {PlayerID} from 'boardgame.io';

export interface IClientGameState {
  drawPileLength: number;
}

export interface IGameRules {
  spectatorsSeeCards: boolean;
  openCards: boolean;
  pendingTimerMs: number;
}

export interface IPendingCardPlay {
  card: ICard;
  playedBy: PlayerID;
  startedAtMs: number;
  expiresAtMs: number;
  lastNopeBy: PlayerID | null;
  nopeCount: number;
  isNoped: boolean;
}

export interface IGameState {
  winner: PlayerID | null;
  drawPile: ICard[];
  discardPile: ICard[];
  pendingCardPlay: IPendingCardPlay | null;
  turnsRemaining: number;
  gameRules: IGameRules;
  deckType: string;
  client: IClientGameState;
  lobbyReady: boolean;
}
