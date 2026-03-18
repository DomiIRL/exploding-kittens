import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class CatCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  /**
   * Cat cards can only be played in pairs
   */
  canBePlayed(context: FnContext, card: Card): boolean {
    const { player, ctx } = context;

    const playerData = player.get();

    // Count how many cat cards with the same index the player has
    const matchingCards = playerData.hand.filter(
      (c: Card) => c.name === card.name && c.index === card.index
    );

    // Need at least 2 matching cat cards to play
    if (matchingCards.length < 2) {
      return false;
    }

    // Check if there is at least one other player with cards
    return Object.keys(player.state).some((playerId) => {
      if (playerId === ctx.currentPlayer) {
        return false; // Can't target yourself
      }
      const targetPlayerData = player.state[playerId];
      return targetPlayerData.isAlive && targetPlayerData.hand.length > 0;
    });
  }

  /**
   * Prompt player to choose a target after pair cost is already consumed.
   */
  onPlayed(context: FnContext, _card: Card) {
    const { events } = context;

    // Set stage to choose a player to steal from
    events.setActivePlayers({
      currentPlayer: 'choosePlayerToStealFrom',
    });
  }

  /**
   * Immediately consume the second matching cat card after the first is played.
   */
  afterPlay(context: FnContext, card: Card) {
    const {G, player} = context;
    const playerData = player.get();

    const secondCardIndex = playerData.hand.findIndex(
      (c: Card) => c.name === card.name && c.index === card.index
    );

    if (secondCardIndex === -1) {
      return;
    }

    const secondCard = playerData.hand[secondCardIndex];
    const newHand = playerData.hand.filter((_: Card, index: number) => index !== secondCardIndex);

    player.set({
      ...playerData,
      hand: newHand,
    });

    G.discardPile.push(secondCard);
  }

  sortOrder(): number {
    return 98;
  }
}

