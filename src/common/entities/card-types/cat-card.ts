import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {stealCard} from "../../moves/steal-card-move";
import {CHOOSE_PLAYER_TO_STEAL_FROM} from "../../constants/stages";

export class CatCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  /**
   * Cat card-types can only be played in pairs
   */
  canBePlayed(game: TheGame, card: Card): boolean {
    const player = game.players.actingPlayer;

    // Need at least 2 matching cat card-types to play
    const matchingCards = player.getMatchingCards(card);
    if (matchingCards.length < 2) {
      return false;
    }

    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    return candidates.length > 0;
  }

  /**
   * Prompt player to choose a target after pair cost is already consumed.
   */
  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);

    if (candidates.length === 1) {
      // Automatically choose the only valid opponent
      stealCard(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_TO_STEAL_FROM);
    }
  }

  /**
   * Immediately consume the second matching cat card after the first is played.
   */
  afterPlay(game: TheGame, card: Card) {
    const player = game.players.actingPlayer;
    // Just find the card but don't remove it directly, use moveTo to ensure logic flows properly
    const matchingCards = player.getMatchingCards(card);
    if (matchingCards.length === 0) {
      console.log("Error: Expected to find a second cat card to consume, but none found.");
      return;
    }
    const secondCard = matchingCards[0];
    secondCard.moveTo(game.piles.discardPile, { delayMs: 150 });
  }

  sortOrder(): number {
    return 6;
  }
}
