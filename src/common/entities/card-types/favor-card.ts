import {CardType} from '../card-type';
import {ICard, IContext} from "../../models";
import {requestCard} from '../../moves/favor-card-move';

export class FavorCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(context: IContext, _card: ICard): boolean {
    const { player, ctx } = context;

    // Check if there is at least one other player with card-types
    return Object.keys(player.state).some((playerId) => {
      if (playerId === ctx.currentPlayer) {
        return false; // Can't target yourself
      }
      const targetPlayerData = player.state[playerId];
      return targetPlayerData.isAlive && targetPlayerData.hand.length > 0;
    });
  }

  onPlayed(context: IContext, _card: ICard) {
    const { events, player, ctx } = context;

    const candidates = Object.keys(player.state).filter((playerId) => {
      const p = player.state[playerId];
      return playerId !== ctx.currentPlayer && p.isAlive && p.hand.length > 0;
    });

    if (candidates.length === 1) {
      // Automatically choose the only valid opponent
      requestCard(context, candidates[0]);
    } else if (candidates.length > 1) {
      // Set stage to choose a player to request a card from
      events.setActivePlayers({
        currentPlayer: 'choosePlayerToRequestFrom',
      });
    }
  }

  sortOrder(): number {
    return 3;
  }
}
