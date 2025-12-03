import { drawCard } from "../moves/draw-move";
import { playCard } from "../moves/play-card-move";
import { skipDeadPlayers } from "../utils/turn-order";

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
};

/**
 * Game moves
 */
export const moves = {
  drawCard: drawCard,
  playCard: playCard,
};
