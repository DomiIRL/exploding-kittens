import type {Card, FnContext, Player} from "../models";
import {cardTypeRegistry} from "../constants/card-types";

export const playCard = (context: FnContext, cardIndex: number) => {
  const {G, player} = context;

  const playerData: Player = player.get();

  if (cardIndex < 0 || cardIndex >= playerData.hand.length) {
    console.error('Invalid card index:', cardIndex);
    return;
  }

  const cardToPlay: Card = playerData.hand[cardIndex];

  if (!cardToPlay) {
    throw new Error('No card to play');
  }

  const cardType = cardTypeRegistry.get(cardToPlay.name);
  if (!cardType) {
    throw new Error('Unknown card type');
  }

  const playable = cardType.canBePlayed(context, cardToPlay)
  if (!playable) {
    return;
  }

  const newHand = playerData.hand.filter((_: Card, index: number) => index !== cardIndex);

  player.set({
    ...playerData,
    hand: newHand,
  });

  G.discardPile.push(cardToPlay);

  cardType.onPlayed(context, cardToPlay);
}
