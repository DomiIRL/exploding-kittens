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

export interface IPiles {
  drawPile: ICard[];
  discardPile: ICard[];
  pendingCardPlay: IPendingCardPlay | null;
}

export interface IGameState {
  winner: PlayerID | null;
  piles: IPiles;
  turnsRemaining: number;
  gameRules: IGameRules;
  deckType: string;
  client: IClientGameState; // todo: remove
}
