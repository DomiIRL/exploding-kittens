import {FnContext} from '../models';
import {PlayerWrapper} from './player-wrapper';

export class PlayerLogic {
  constructor(private context: FnContext) {}

  /**
   * Get a player wrapper instance for a specific player ID.
   * Throws if player data not found.
   */
  getPlayer(id: string): PlayerWrapper {
    // boardgame.io player plugin structure
    const playerData = this.context.player.state?.[id];
    if (!playerData) {
      throw new Error(`Player data not found for ID: ${id}`);
    }
    return new PlayerWrapper(playerData, id);
  }

  /**
   * Get a wrapper for the current player based on context.currentPlayer
   */
  get currentPlayer(): PlayerWrapper {
    return this.getPlayer(this.context.ctx.currentPlayer);
  }

  /**
   * Get a wrapper for the player executing the move (if playerID available in context)
   * Falls back to currentPlayer if playerID not set
   */
  get actingPlayer(): PlayerWrapper {
    const id = this.context.playerID ?? this.context.ctx.currentPlayer;
    return this.getPlayer(id);
  }

  /**
   * Get all players as wrappers
   */
  get allPlayers(): PlayerWrapper[] {
    const playerIDs = Object.keys(this.context.player.state || {});
    return playerIDs.map(id => this.getPlayer(id));
  }

  /**
   * Validate if a player is a valid target for an action.
   * Checks if target is alive, has cards, and is not the current player.
   */
  validateTarget(targetPlayerId: string): PlayerWrapper {
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
      throw new Error('Target player has no cards');
    }

    return target;
  }
}

