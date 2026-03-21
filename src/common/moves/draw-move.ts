import {IContext} from "../models";
import {EXPLODING_KITTEN, DEFUSE} from "../constants/card-types";
import {Game} from "../entities/game";

export const drawCard = (context: IContext) => {
  const { events } = context;
  const game = new Game(context);
  const player = game.actingPlayer;

  if (!player.isAlive) {
    throw new Error('Dead player cannot draw card-types');
  }

  const cardToDraw = game.drawCardFromPile();
  if (!cardToDraw) {
    throw new Error('No card to draw');
  }

  player.addCard(cardToDraw);

  // Handle Exploding Kitten
  if (cardToDraw.name === EXPLODING_KITTEN.name) {
    // Check for Defuse
    const hasDefuse = player.hasCard(DEFUSE.name);

    if (hasDefuse) {
      events.setStage('defuseExplodingKitten')
      return;
    }

    // No Defuse - Player Explodes!
    player.eliminate();
    events.endTurn();
    return;
  }

  // Safe card
  events.endTurn();
};
