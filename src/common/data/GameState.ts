import {Card} from "./Card";

export interface GameState {
  drawPile: Card[];
  discardPile: string[];
}