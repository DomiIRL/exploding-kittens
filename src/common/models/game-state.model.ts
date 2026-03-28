import type {ICard} from './card.model';
import type {PlayerID} from 'boardgame.io';

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
  drawPile: IPile;
  discardPile: IPile;
  pendingCardPlay: IPendingCardPlay | null;
}

export interface IPile {
  cards: ICard[];
  size: number;
}

export interface IAnimationQueue {
  [key: number]: IAnimation[];
}

export interface IAnimation {
  from: number | string;
  to: number | string;
  card: ICard | null;
  visibleTo: PlayerID[];
  durationMs: number;
}

export interface IGameState {
  winner: PlayerID | null;
  piles: IPiles;
  turnsRemaining: number;
  gameRules: IGameRules;
  deckType: string;
  animationsQueue: IAnimationQueue;
  nextCardId: number;
}
