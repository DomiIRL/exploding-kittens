import {PlayerID} from "boardgame.io";
import {TheGame} from "../entities/game";

export function stealCard(game: TheGame, targetPlayerId: PlayerID) {
  // Validate target player
  const targetPlayer = game.players.validateTarget(targetPlayerId);

  game.players.actingPlayer.stealRandomCardFrom(targetPlayer);

  game.turnManager.endStage();
}
