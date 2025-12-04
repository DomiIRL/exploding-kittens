import {drawCard} from "../moves/draw-move";
import {playCard} from "../moves/play-card-move";
import {skipDeadPlayers} from "../utils/turn-order";

export const GAME_CONFIG = {
  name: 'ExplodingKittens',
  minMoves: 1,
} as const;

/**
 * Turn configuration
 */
export const turnConfig = {
  minMoves: GAME_CONFIG.minMoves,
  order: skipDeadPlayers,
  onEnd: ({G}: any) => {
    // Decrement the turns remaining counter
    G.turnsRemaining = G.turnsRemaining - 1;

    // If we're moving to the next player, reset the counter
    if (G.turnsRemaining <= 0) {
      G.turnsRemaining = 1;
    }
  },
};

/**
 * Game moves
 */
export const moves = {
  drawCard: drawCard,
  playCard: playCard,
};
