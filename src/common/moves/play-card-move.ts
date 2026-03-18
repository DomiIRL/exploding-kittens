import type {Card, FnContext, Player} from "../models";
import {cardTypeRegistry} from "../constants/card-types";

export const NOW_CARD_RESPONSE_WINDOW_MS = 4000;

const getActingPlayerID = (context: FnContext): string => {
  if (context.playerID) {
    return context.playerID;
  }

  const ctxWithPlayerID = context.ctx as typeof context.ctx & {playerID?: string};
  return ctxWithPlayerID.playerID ?? context.ctx.currentPlayer;
};

const removeCardFromHand = (playerData: Player, cardIndex: number): Player => {
  const newHand = playerData.hand.filter((_: Card, index: number) => index !== cardIndex);

  return {
    ...playerData,
    hand: newHand,
  };
};

const playCardFromHand = (context: FnContext, cardIndex: number): Card | null => {
  const {player} = context;
  const playerID = getActingPlayerID(context);

  const playerData: Player | undefined = player.state[playerID];
  if (!playerData) {
    console.error('No player data for player ID:', playerID);
    return null;
  }

  if (cardIndex < 0 || cardIndex >= playerData.hand.length) {
    console.error('Invalid card index:', cardIndex);
    return null;
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
    return null;
  }

  player.state[playerID] = removeCardFromHand(playerData, cardIndex);

  return cardToPlay;
};

const clearNowCardWindow = (context: FnContext) => {
  const {events} = context;
  events.setActivePlayers({value: {}});
};

export const playCard = (context: FnContext, cardIndex: number) => {
  const {G, events} = context;
  const cardToPlay = playCardFromHand(context, cardIndex);

  if (!cardToPlay) {
    return;
  }

  const cardType = cardTypeRegistry.get(cardToPlay.name);

  if (!cardType) {
    throw new Error('Unknown card type');
  }

  G.discardPile.push(cardToPlay);

  if (cardType.isNowCard(context, cardToPlay)) {
    cardType.onPlayed(context, cardToPlay);
    return;
  }

  cardType.afterPlay(context, cardToPlay);

  const actingPlayerID = getActingPlayerID(context);
  const startedAtMs = Date.now();
  G.pendingCardPlay = {
    card: {...cardToPlay},
    playedBy: actingPlayerID,
    startedAtMs,
    expiresAtMs: startedAtMs + NOW_CARD_RESPONSE_WINDOW_MS,
    lastNopeBy: null,
    isNoped: false,
  };

  // Current player can resolve once the timer is over; others may react with now cards.
  events.setActivePlayers({
    currentPlayer: 'awaitingNowCards',
    others: {
      stage: 'respondWithNowCard',
    },
  });
};

export const playNowCard = (context: FnContext, cardIndex: number) => {
  const {G} = context;
  const playerID = getActingPlayerID(context);
  const playerData: Player | undefined = context.player.state[playerID];

  if (!playerData) {
    console.error('No player data for player ID:', playerID);
    return;
  }


  if (cardIndex < 0 || cardIndex >= playerData.hand.length) {
    return;
  }
  const selectedCard = playerData.hand[cardIndex];

  const selectedCardType = selectedCard ? cardTypeRegistry.get(selectedCard.name) : null;
  if (!selectedCard || !selectedCardType || !selectedCardType.isNowCard(context, selectedCard)) {
    return;
  }
  const cardToPlay = playCardFromHand(context, cardIndex);

  if (!cardToPlay) {
    return;
  }
  const cardType = cardTypeRegistry.get(cardToPlay.name);

  if (!cardType) {
    throw new Error('Unknown card type');
  }
  if (!cardType.isNowCard(context, cardToPlay)) {
    return;
  }
  G.discardPile.push(cardToPlay);
  cardType.onPlayed(context, cardToPlay);
};

export const resolvePendingCard = (context: FnContext) => {
  const {G, playerID, ctx} = context;
  const pendingCardPlay = G.pendingCardPlay;

  if (!pendingCardPlay || playerID !== ctx.currentPlayer) {
    return;
  }

  if (Date.now() < pendingCardPlay.expiresAtMs) {
    return;
  }

  const cardType = cardTypeRegistry.get(pendingCardPlay.card.name);

  if (!cardType) {
    throw new Error('Unknown card type');
  }

  G.pendingCardPlay = null;
  clearNowCardWindow(context);

  if (!pendingCardPlay.isNoped) {
    cardType.onPlayed(context, pendingCardPlay.card);
  }
}
