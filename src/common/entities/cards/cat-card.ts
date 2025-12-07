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
    const playerData = context.player.get();

    // Count how many cat cards with the same index the player has
    const matchingCards = playerData.hand.filter(
      (c: Card) => c.name === card.name && c.index === card.index
    );

    // Need at least 2 matching cat cards to play
    return matchingCards.length >= 2;
  }

  /**
   * When played, remove a second matching cat card and prompt player to choose a target
   */
  onPlayed(context: FnContext, card: Card) {
    const { G, player, events } = context;
    const playerData = context.player.get();

    // Find and remove the second matching cat card from hand
    const secondCardIndex = playerData.hand.findIndex(
      (c: Card) =>
        c.name === card.name &&
        c.index === card.index
    );

    if (secondCardIndex !== -1) {
      const newHand = playerData.hand.filter((_: Card, idx: number) => idx !== secondCardIndex);
      player.set({
        ...playerData,
        hand: newHand,
      });

      // Add the second card to discard pile
      G.discardPile.push(playerData.hand[secondCardIndex]);
    }

    // Set stage to choose a player to steal from
    events.setActivePlayers({
      currentPlayer: 'choosePlayerToStealFrom',
    });
  }
}

