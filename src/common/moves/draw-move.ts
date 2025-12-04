import type {Card, FnContext, Player} from "../models";
import {EXPLODING_KITTEN, DEFUSE} from "../constants/card-types";

export const drawCard = (context: FnContext) => {
  const { G, player, events, random } = context;
  const cardToDraw = G.drawPile.pop();
  if (!cardToDraw) {
    throw new Error('No card to draw');
  }

  const playerData: Player = player.get();
  let alive: boolean = playerData.isAlive;

  if (!alive) {
    throw new Error('Dead player cannot draw cards');
  }
  let newHand: Card[] = playerData.hand.map((card: any) => ({...card}));
  const discardPile = G.discardPile;

  // Handle drawing an exploding kitten
  let dead = cardToDraw.name === EXPLODING_KITTEN.name
  if (dead) {
    const defuseIndex = playerData.hand.findIndex((card: Card) => card.name === DEFUSE.name);
    if (defuseIndex !== -1) {
      const defuseCard = playerData.hand[defuseIndex];
      // put the exploding kitten randomly back in the draw pile
      const randomPosition = Math.floor(random.Number() * (G.drawPile.length + 1));
      G.drawPile.splice(randomPosition, 0, cardToDraw);
      discardPile.push(defuseCard);
      newHand.splice(defuseIndex, 1);
      dead = false;
    }
  }

  if (dead) {
    alive = false;
    newHand = []
    // push all hand cards to discard pile
    discardPile.push(...playerData.hand, cardToDraw);
  } else if (cardToDraw.name !== EXPLODING_KITTEN.name) {
    newHand.push({...cardToDraw});
  }

  player.set({
    ...playerData,
    hand: newHand,
    hand_count: newHand.length,
    isAlive: alive,
  });

  events.endTurn();
}
