import {TheGame} from "../entities/game";

export const playCard = (game: TheGame, cardIndex: number) => {
  game.players.actingPlayer.playCard(cardIndex);
};

export const playNowCard = (game: TheGame, cardIndex: number) => {
  playCard(game, cardIndex);
};

export const resolvePendingCard = (game: TheGame) => {
  game.piles.resolvePendingCard();
};

