import {ICard} from "../../common";

export type AnimationEndpoint =
  | { kind: 'pile'; id: 'draw-pile' | 'discard-pile' }
  | { kind: 'player'; id: string };

export type CardVisibility =
  | { type: 'public' }                      // everyone sees face
  | { type: 'participants'; ids: string[] } // only these players see face
  | { type: 'hidden' };                     // everyone sees backside

export interface CardMovement {
  card: ICard | null;
  from: AnimationEndpoint;
  to: AnimationEndpoint;
  visibility: CardVisibility;
  staggerIndex: number;
}

export interface StateSnapshot {
  drawSize: number;
  discardSize: number;
  discardTop: ICard | null;
  handCounts: Record<string, number>;
  selfHand: ICard[];
}

export interface HandChange {
  playerId: string;
  delta: number;
}

export interface StateDiff {
  drawDelta: number;
  discardDelta: number;
  gainers: HandChange[];
  losers: HandChange[];
}
