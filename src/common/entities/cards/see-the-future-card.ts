import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class SeeTheFutureCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: FnContext, _card: Card) {
    const { events } = context;

    // Set stage to view the future
    events.setActivePlayers({
      currentPlayer: 'viewingFuture',
    });
  }

  sortOrder(): number {
    return 5;
  }
}
