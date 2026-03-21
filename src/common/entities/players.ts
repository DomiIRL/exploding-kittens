import {Player} from './player';
import {Game} from "./game";

export class Players {
  constructor(private game: Game) {}

  /**
   * Get a player wrapper instance for a specific player ID.
   * Throws if player data not found.
   */
  getPlayer(id: string): Player {
    // boardgame.io player plugin structure
    const playerData = this.game.context.player.state?.[id];
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
   * Get a wrapper for the player executing the move (if playerID available in context)
   * Falls back to currentPlayer if playerID not set
   */
  get actingPlayer(): Player {
    const id = this.game.context.playerID ?? this.game.context.ctx.currentPlayer;
    return this.getPlayer(id);
  }

  /**
   * Get all players as wrappers
   */
  get allPlayers(): Player[] {
    const playerIDs = Object.keys(this.game.context.player.state || {});
    return playerIDs.map(id => this.getPlayer(id));
  }

  /**
   * Validate if a player is a valid target for an action.
   * Checks if target is alive, has card-types, and is not the current player.
   */
  validateTarget(targetPlayerId: string): Player {
    const target = this.getPlayer(targetPlayerId);

    let current;
    try {
      current = this.currentPlayer;
    } catch(e) {
      // Current player might be undefined in some contexts
    }

    if (current && target.id === current.id) {
       throw new Error('Cannot target yourself');
    }

    if (!target.isAlive) {
      throw new Error('Target player is dead');
    }

    if (target.getCardCount() === 0) {
      throw new Error('Target player has no card-types');
    }

    return target;
  }
}

