import {Card} from "../../common";

export default class PlayerState {
  isSelfSpectator: boolean;
  isSelf: boolean;
  isAlive: boolean;
  isTurn: boolean;
  handCount: number;
  hand: Card[];

  constructor(isSelfSpectator: boolean, isSelf: boolean, isAlive: boolean, isTurn: boolean, handCount: number, hand: Card[]) {
    this.isSelfSpectator = isSelfSpectator;
    this.isSelf = isSelf;
    this.isAlive = isAlive;
    this.isTurn = isTurn;
    this.handCount = handCount;
    this.hand = hand;
  }
}
