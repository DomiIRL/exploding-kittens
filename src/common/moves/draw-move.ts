import {TheGame} from "../entities/game";

export const drawCard = (game: TheGame) => {
  game.players.actingPlayer.draw();
};

