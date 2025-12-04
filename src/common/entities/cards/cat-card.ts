import {CardType} from '../card-type';
import {Card, FnContext, Player} from "../../models";

export class CatCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  /**
   * Find all indices in the player's hand that match the given card (same name and index)
   * @param hand - The player's hand
   * @param card - The card to match against
   * @returns Array of indices where matching cards are found
   */
  private findMatchingCardIndices(hand: Card[], card: Card): number[] {
    return hand.reduce((indices: number[], handCard: Card, index: number) => {
      if (handCard.name === card.name && handCard.index === card.index) {
        indices.push(index);
      }
      return indices;
    }, []);
  }

  canBePlayed(context: FnContext, card: Card): boolean {
    const { player } = context;
    const playerData: Player = player.get();

    // Find all matching cards in the hand
    const matchingIndices = this.findMatchingCardIndices(playerData.hand, card);

    // Player needs at least 2 matching cards (the one they want to play and another)
    return matchingIndices.length >= 2;
  }

  onPlayed(context: FnContext, card: Card) {
    const { G, player } = context;
    const playerData: Player = player.get();

    const matchingIndices = this.findMatchingCardIndices(playerData.hand, card);
    const cardToPlay = playerData.hand[matchingIndices[0]];
    const newHand = playerData.hand.filter((_: Card, index: number) => index !== matchingIndices[0]);

    player.set({
      ...playerData,
      hand: newHand,
    });

    G.discardPile.push(cardToPlay);
  }

}