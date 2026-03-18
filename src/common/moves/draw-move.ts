import {FnContext} from "../models";
import {EXPLODING_KITTEN, DEFUSE} from "../constants/card-types";
import {GameLogic} from "../wrappers/game-logic";

export const drawCard = (context: FnContext) => {
  const { events, random } = context;
  const game = new GameLogic(context);
  const player = game.actingPlayer;

  if (!player.isAlive) {
    throw new Error('Dead player cannot draw cards');
  }

  const cardToDraw = game.drawCardFromPile();
  if (!cardToDraw) {
    throw new Error('No card to draw');
  }

  // Handle Exploding Kitten
  if (cardToDraw.name === EXPLODING_KITTEN.name) {
    // Check for Defuse
    const defuseCard = player.removeCard(DEFUSE.name);
    
    if (defuseCard) {
      // Player had a Defuse!
      // 1. Play Defuse to discard
      game.discardCard(defuseCard);

      // 2. Put Exploding Kitten back into draw pile at random position
      const insertIndex = Math.floor(random.Number() * (game.drawPileSize + 1));
      game.insertCardIntoDrawPile(cardToDraw, insertIndex);
      
      // Player is safe, turn ends
      events.endTurn();
      return;
    }

    // No Defuse - Player Explodes!
    game.discardCard(cardToDraw);
    
    // Discard all cards from hand
    const handCards = player.removeAllCardsFromHand(); 
    handCards.forEach(c => game.discardCard(c));
    
    player.eliminate();
    events.endTurn();
    return;
  }

  // Safe card
  player.addCard(cardToDraw);
  events.endTurn();
};
