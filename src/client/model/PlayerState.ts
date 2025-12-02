import {Card} from "../../common";

export default class PlayerState {
    isSelf: boolean;
    isAlive: boolean;
    handCount: number;
    hand: Card[];

    constructor(isSelf: boolean, isAlive: boolean, handCount: number, hand: Card[]) {
        this.isSelf = isSelf;
        this.isAlive = isAlive;
        this.handCount = handCount;
        this.hand = hand;
    }
}
