import {TheGame} from "../entities/game";

/**
 * Close the see the future overlay
 */
export const closeFutureView = (game: TheGame) => {
  game.turnManager.endStage();
};

