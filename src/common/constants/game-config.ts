export const GAME_CONFIG = {
  name: 'ExplodingKittens',
  minMoves: 1,
} as const;

/**
 * Turn configuration
 */
export const turnConfig = {
  minMoves: GAME_CONFIG.minMoves,
};

/**
 * Game moves
 */
export const moves = {};
