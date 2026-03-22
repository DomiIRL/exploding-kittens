import {IContext} from '../models';
import {TheGame} from "../entities/game";

const findNextAlivePlayer = (game: TheGame, startPos: number): number | undefined => {
  const numPlayers = game.players.playerCount;
  let currentPos = startPos % numPlayers;

  // Check all players once to avoid infinite loops
  for (let i = 0; i < numPlayers; i++) {
    const playerId = game.turnManager.playOrder[currentPos];

    if (game.players.getPlayer(playerId).isAlive) {
      return currentPos;
    }

    currentPos = (currentPos + 1) % numPlayers;
  }

  // No alive players found
  return undefined;
};

export const turnOrder = {
  first: (context: IContext): number => {
    const game = new TheGame(context)

    const nextAlive = findNextAlivePlayer(game, 0);
    // Fallback to first player if no one is alive (shouldn't happen)
    return nextAlive ?? 0;
  },

  /**
   * Get the next alive player, considering turnsRemaining counter
   * Note: We only read turnsRemaining here, the decrement happens in turn.onEnd
   */
  next: (context: IContext): number | undefined => {
    const game = new TheGame(context)

    // If there are still turns remaining (> 1 because we check before decrement), stay with the current player
    const playOrderPos = game.turnManager.playOrderPos;
    if (game.turnManager.turnsRemaining > 1) {
      return playOrderPos;
    }


    // Move to the next alive player
    // return findNextAlivePlayer(ctx, player.state, ctx.playOrderPos + 1);
    return findNextAlivePlayer(game, playOrderPos + 1);
  },

  /**
   * Shuffle the play order at the start of the play phase
   */
  playOrder: ({ ctx, random }: IContext): string[] => {
    const ids = Array.from({ length: ctx.numPlayers }, (_, i) => String(i));
    return random.Shuffle(ids);
  },
};
