import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {requestCard} from '../../moves/favor-card-move';
import {CHOOSE_PLAYER_TO_REQUEST_FROM} from "../../constants/stages";

export class FavorCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const { ctx } = game.context;

    const candidates = game.players.allPlayers.filter((target) => {
      return target.id !== ctx.currentPlayer && target.isAlive && target.cardCount > 0;
    });

    if (candidates.length === 1) {
      // Automatically choose the only valid opponent
      requestCard(game, candidates[0].id);
    } else if (candidates.length > 1) {
      // Set stage to choose a player to request a card from
      game.turnManager.setStage(CHOOSE_PLAYER_TO_REQUEST_FROM)
    }

  }

  sortOrder(): number {
    return 3;
  }
}
