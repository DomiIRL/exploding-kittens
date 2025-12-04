import type {FnContext} from 'boardgame.io';
import type {GameState, PluginAPIs} from '../models';

const findNextAlivePlayer = (
  ctx: FnContext<GameState, PluginAPIs>['ctx'],
  players: Record<string, any>,
  startPos: number
): number | undefined => {
  const numPlayers = ctx.numPlayers;
  let currentPos = startPos % numPlayers;

  // Check all players once to avoid infinite loops
  for (let i = 0; i < numPlayers; i++) {
    const playerId = ctx.playOrder[currentPos];

    if (players[playerId]?.isAlive) {
      return currentPos;
    }

    currentPos = (currentPos + 1) % numPlayers;
  }

  // No alive players found
  return undefined;
};

export const skipDeadPlayers = {
  first: ({ctx, player}: FnContext<GameState, PluginAPIs>): number => {
    const nextAlive = findNextAlivePlayer(ctx, player.state, 0);
    // Fallback to first player if no one is alive (shouldn't happen)
    return nextAlive ?? 0;
  },

  /**
   * Get the next alive player, considering turnsRemaining counter
   * Note: We only read G.turnsRemaining here, the decrement happens in turn.onEnd
   */
  next: ({G, ctx, player}: FnContext<GameState, PluginAPIs>): number | undefined => {
    // If there are still turns remaining (> 1 because we check before decrement), stay with the current player
    if (G.turnsRemaining > 1) {
      return ctx.playOrderPos;
    }


    // Move to the next alive player
    return findNextAlivePlayer(ctx, player.state, ctx.playOrderPos + 1);
  },
};
