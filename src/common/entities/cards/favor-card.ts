import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class FavorCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: FnContext, _card: Card) {
    const { events } = context;

    // Set stage to choose a player to request a card from
    events.setActivePlayers({
      currentPlayer: 'choosePlayerToRequestFrom',
    });
  }

  sortOrder(): number {
    return 3;
  }
}
