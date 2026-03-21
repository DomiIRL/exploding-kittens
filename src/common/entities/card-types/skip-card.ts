import {CardType} from '../card-type';
import {ICard, IContext} from "../../models";

export class SkipCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: IContext, _card: ICard) {
    const { events } = context;
    events.endTurn();
  }

  sortOrder(): number {
    return 2;
  }
}
