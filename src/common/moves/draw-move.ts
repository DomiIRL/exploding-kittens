import {IContext} from "../models";
import {TheGame} from "../entities/game";

export const drawCard = (context: IContext) => {
  const game = new TheGame(context);
  try {
    game.players.actingPlayer.draw();
  } catch (e) {
    console.error("Failed to draw card", e);
  }
};

