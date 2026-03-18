import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class FavorCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(context: FnContext, _card: Card): boolean {
    const { player, ctx } = context;

    // Check if there is at least one other player with cards
    return Object.keys(player.state).some((playerId) => {
      if (playerId === ctx.currentPlayer) {
        return false; // Can't target yourself
      }
      const targetPlayerData = player.state[playerId];
      return targetPlayerData.isAlive && targetPlayerData.hand.length > 0;
    });
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
