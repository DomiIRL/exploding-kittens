import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class SkipCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: FnContext, _card: Card) {
    const { events } = context;
    events.endTurn();
  }

  sortOrder(): number {
    return 2;
  }
}
