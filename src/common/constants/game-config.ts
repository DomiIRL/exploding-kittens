import type {GameState} from "../models";

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
export const moves = {
  drawCard: ({ G, player }: { G: GameState; player: any }) => {
    const cardToDraw = G.drawPile.pop();
    if (!cardToDraw) {
      throw new Error('No card to draw');
    }

    const playerData = player.get();

    const newHand = playerData.hand.map((card: any) => ({ ...card }));
    newHand.push({ ...cardToDraw });

    player.set({
      ...playerData,
      hand: newHand,
      hand_count: newHand.length
    });
  }
};
