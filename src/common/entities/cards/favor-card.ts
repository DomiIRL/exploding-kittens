import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";
import {requestCard} from '../../moves/favor-card-move';

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
