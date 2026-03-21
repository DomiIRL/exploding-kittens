import {CardType} from '../card-type';
import {ICard, IContext} from "../../models";

export class SeeTheFutureCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: IContext, _card: ICard) {
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
