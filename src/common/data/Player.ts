import type {Card} from "./Card.ts";

export interface Player {
    hand: Card[];
    hand_count: number;
    isAlive: boolean;
}