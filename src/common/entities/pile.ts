import {IPile} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {CardList} from "./card-list";

export class Pile extends CardList {

  constructor(public readonly name: string, game: TheGame, public state: IPile) {
    super(
      game,
      () => state.cards,
      (cards) => { state.cards = cards; },
      () => { state.size = state.cards.length; }
    );
  }

  get allCards(): Card[] {
    return this.cards;
  }

  get size(): number {
    return this.state.size;
  }

  updateSize(): void {
    this.state.size = this.length;
  }
}
