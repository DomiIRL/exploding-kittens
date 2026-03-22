import {Player} from './player';
import {TheGame} from "./game";
import {PlayerID} from "boardgame.io";
import {IGameState, IPlayers} from "../models";

export class Players {
  constructor(private game: TheGame, private gamestate: IGameState, public players: IPlayers) {}

  /**
   * Get a player wrapper instance for a specific player ID.
   * Throws if player data not found.
   */
  getPlayer(id: PlayerID): Player {
    // boardgame.io player plugin structure
    const playerData = this.players?.[id];
    if (!playerData) {
      throw new Error(`Player data not found for ID: ${id}`);
    }
    return new Player(this.game, playerData, id);
  }

  /**
   * Get a wrapper for the current player based on context.currentPlayer
   */
  get currentPlayer(): Player {
    return this.getPlayer(this.game.context.ctx.currentPlayer);
  }

  /**
   * Get the player executing the move (if playerID available in context)
   * Falls back to currentPlayer if playerID not set
   */
  get actingPlayer(): Player {
    const id = this.game.context.playerID ?? this.game.context.ctx.currentPlayer;
    return this.getPlayer(id);
  }

  get winner(): Player | null {
    return this.gamestate.winner ? this.getPlayer(this.gamestate.winner) : null;
  }

  /**
   * Get all players
   */
  get allPlayers(): Player[] {
    return this.game.turnManager.playOrder
      .map(id => this.getPlayer(id))
      .filter(player => player !== null) as Player[];
  }

  /**
   * Get all alive players
   */
  get alivePlayers(): Player[] {
    return this.allPlayers.filter(player => player.isAlive);
  }

  /**
   * Get all alive players who have at least one card in hand
   */
  get playersWithCards(): Player[] {
    return this.alivePlayers.filter(player => player.cardCount > 0);
  }

  /**
   * Get all alive players who have at least one card in hand
   */
  getValidCardActionTargets(exclude: PlayerID | Player): Player[] {
    return this.playersWithCards.filter(player => (player.id !== (exclude instanceof Player ? exclude.id : exclude)));
  }

  /**
   * Validate if a player is a valid target for an action.
   * Checks if target is alive, has card-types, and is not the current player.
   */
  validateTarget(targetPlayerId: string): Player {
    const player = this.getPlayer(targetPlayerId);
    if (!player) {
      throw new Error(`Player with ID ${targetPlayerId} not found`);
    }
    if (!player.isValidCardTarget) {
      throw new Error(`Player with ID ${targetPlayerId} is not a valid target (must be alive and have cards)`);
    }
    return player;
  }
}

