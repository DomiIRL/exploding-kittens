import {IContext} from "../models";
import {TheGame} from "../entities/game";

export const playCard = (context: IContext, cardIndex: number) => {
  const game = new TheGame(context);
  try {
    game.players.actingPlayer.playCard(cardIndex);
  } catch (e) {
    console.error('Failed to play card', e);
  }
};

export const playNowCard = (context: IContext, cardIndex: number) => {
  playCard(context, cardIndex);
};

export const resolvePendingCard = (context: IContext) => {
  const game = new TheGame(context);
  game.resolvePendingCard();
};

