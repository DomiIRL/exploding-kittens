import {FnContext} from "../models";
import {cardTypeRegistry} from "../constants/card-types";
import {GameLogic} from "../wrappers/game-logic";


export const playCard = (context: FnContext, cardIndex: number) => {
  const {events} = context;
  const game = new GameLogic(context);
  const player = game.actingPlayer;
  const hand = player.hand;

  if (cardIndex < 0 || cardIndex >= hand.length) {
    console.error('Invalid card index:', cardIndex);
    return;
  }

  // Peek at the card first to check validity
  const cardPeek = hand[cardIndex];
  const cardType = cardTypeRegistry.get(cardPeek.name);

  if (!cardType) {
    throw new Error('Unknown card type: ' + cardPeek.name);
  }

  if (!cardType.canBePlayed(context, cardPeek)) {
    return;
  }

  // Actually remove the card
  const cardToPlay = player.removeCardAt(cardIndex);
  if (!cardToPlay) {
    return; // Should not happen given checks above
  }

  game.discardCard(cardToPlay);

  if (cardType.isNowCard(context, cardToPlay)) {
    // Immediate resolution for Now cards (like Nope)
    cardType.onPlayed(context, cardToPlay);
    return;
  }
  
  cardType.afterPlay(context, cardToPlay);
  
  // For normal action cards, setup pending state
  const actingPlayerID = player.id;
  const startedAtMs = Date.now();
  
  game.pendingCardPlay = {
    card: {...cardToPlay},
    playedBy: actingPlayerID,
    startedAtMs,
    expiresAtMs: startedAtMs + game.gameRules.nopeTimerMs,
    lastNopeBy: null,
    nopeCount: 0,
    isNoped: false,
  };

  events.setActivePlayers({
    currentPlayer: 'awaitingNowCards',
    others: {
      stage: 'respondWithNowCard',
    },
  });
};

export const playNowCard = (context: FnContext, cardIndex: number) => {
  const game = new GameLogic(context);
  const player = game.actingPlayer;
  const hand = player.hand;

  if (cardIndex < 0 || cardIndex >= hand.length) {
    return;
  }

  const selectedCard = hand[cardIndex];
  const cardType = cardTypeRegistry.get(selectedCard.name);
  
  if (!cardType || !cardType.isNowCard(context, selectedCard)) {
    return;
  }

  // Validate playability (e.g. can we Nope?)
  if (!cardType.canBePlayed(context, selectedCard)) {
    return;
  }

  // Remove and play
  const cardToPlay = player.removeCardAt(cardIndex);
  if (!cardToPlay) return;

  game.discardCard(cardToPlay);
  cardType.onPlayed(context, cardToPlay);
};

export const resolvePendingCard = (context: FnContext) => {
  const {ctx} = context;
  const game = new GameLogic(context);
  const pendingCardPlay = game.pendingCardPlay;

  // Only current player can resolve their own pending card after timeline expires
  if (!pendingCardPlay || game.actingPlayer.id !== ctx.currentPlayer) {
    return;
  }

  if (Date.now() < pendingCardPlay.expiresAtMs) {
    return;
  }

  const cardType = cardTypeRegistry.get(pendingCardPlay.card.name);
  if (!cardType) {
    throw new Error('Unknown card type');
  }

  game.pendingCardPlay = null;
  context.events.setActivePlayers({value: {}}); // Clear stages

  if (!pendingCardPlay.isNoped) {
    cardType.onPlayed(context, pendingCardPlay.card);
  }
};
