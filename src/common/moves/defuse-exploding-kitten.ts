import {IContext} from "../models";
import {TheGame} from "../entities/game";

export const defuseExplodingKitten = (context: IContext, insertIndex: number) => {
  const game = new TheGame(context);
  try {
    game.players.actingPlayer.defuseExplodingKitten(insertIndex);
  } catch (e) {
    console.error("Failed to defuse exploding kitten", e);
  }
};

