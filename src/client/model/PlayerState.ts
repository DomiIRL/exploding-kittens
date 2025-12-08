import {Card, sortCards} from "../../common";

export interface CardWithServerIndex extends Card {
  serverIndex: number;
}

export default class PlayerState {
  isSelfSpectator: boolean;
  isSelf: boolean;
  isAlive: boolean;
  isTurn: boolean;
  handCount: number;
  hand: CardWithServerIndex[];

  constructor(isSelfSpectator: boolean, isSelf: boolean, isAlive: boolean, isTurn: boolean, handCount: number, hand: Card[]) {
    this.isSelfSpectator = isSelfSpectator;
    this.isSelf = isSelf;
    this.isAlive = isAlive;
    this.isTurn = isTurn;
    this.handCount = handCount;

    // Create cards with server indices before sorting
    const cardsWithIndices: CardWithServerIndex[] = hand.map((card, index) => ({
      ...card,
      serverIndex: index
    }));

    // Sort the hand by card type sort order and card index
    this.hand = sortCards(cardsWithIndices) as CardWithServerIndex[];
  }
}
