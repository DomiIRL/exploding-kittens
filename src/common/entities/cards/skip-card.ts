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

  cleanupPendingState(_context: FnContext) {
    // Skip ends the turn, so we don't clear stages to avoid interfering with endTurn
  }

  sortOrder(): number {
    return 2;
  }
}
