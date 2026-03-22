import {TheGame} from "../entities/game";

export const defuseExplodingKitten = (game: TheGame, insertIndex: number) => {
  game.players.actingPlayer.defuseExplodingKitten(insertIndex);
};

