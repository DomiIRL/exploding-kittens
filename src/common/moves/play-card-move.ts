import {FnContext} from "../models";
import {cardTypeRegistry, NOPE} from "../constants/card-types";
import {GameLogic} from "../wrappers/game-logic";


export const playCard = (context: FnContext, cardIndex: number) => {
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
  cardType.afterPlay(context, cardToPlay);

  if (cardType.isNowCard(context, cardToPlay)) {
    // Immediate resolution for Now cards (like Nope)
    cardType.onPlayed(context, cardToPlay);
    return;
  }

  // For normal action cards, setup pending state
  const actingPlayerID = player.id;
  const startedAtMs = Date.now();
  
  game.pendingCardPlay = {
    card: {...cardToPlay},
    playedBy: actingPlayerID,
    startedAtMs,
    expiresAtMs: startedAtMs + game.gameRules.pendingTimerMs,
    lastNopeBy: null,
    nopeCount: 0,
    isNoped: false,
  };

  // Skip wait if playing with open cards and no one else can Nope
  if (game.gameRules.openCards) {
    const otherPlayers = game.allPlayers.filter(p => p.id !== actingPlayerID && p.isAlive);
    const canSomeoneNope = otherPlayers.some(p => p.hasCard(NOPE.name));
    
    if (!canSomeoneNope) {
       // Expire immediately to allow client to animate the play before resolution
       game.pendingCardPlay!.expiresAtMs = startedAtMs;
    }
  }

  cardType.setupPendingState(context);
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

  // Optimization: If open cards are enabled and no one else can Nope back, resolve immediately
  if (game.gameRules.openCards) {
    const pending = game.pendingCardPlay;
    if (pending) {
       const lastNopeBy = pending.lastNopeBy;
       // Anyone EXCEPT the last noper can potentially nope back
       const potentialNopers = game.allPlayers.filter(p => p.id !== lastNopeBy && p.isAlive);
       const canAnyoneNope = potentialNopers.some(p => p.hasCard(NOPE.name));

       if (!canAnyoneNope) {
         // Expire immediately
         pending.expiresAtMs = Date.now();
       }
    }
  }
};

export const resolvePendingCard = (context: FnContext) => {
  const game = new GameLogic(context);
  const pendingCardPlay = game.pendingCardPlay;

  // Check if we have a pending card to resolve
  if (!pendingCardPlay) {
    return;
  }

  // Check if the timer has expired
  // We allow ANY player to trigger resolution if the timer has expired
  // This prevents the game from getting stuck if the current player disconnects
  if (Date.now() < pendingCardPlay.expiresAtMs) {
    return;
  }

  game.pendingCardPlay = null;

  const cardType = cardTypeRegistry.get(pendingCardPlay.card.name);
  if (!cardType) {
    return;
  }

  cardType.cleanupPendingState(context);

  if (!pendingCardPlay.isNoped) {
    cardType.onPlayed(context, pendingCardPlay.card);
  }
};
