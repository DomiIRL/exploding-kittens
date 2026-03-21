import {IContext} from "../models";
import {Game} from "../entities/game";
import {DEFUSE, EXPLODING_KITTEN} from "../constants/card-types";

export const defuseExplodingKitten = (context: IContext, insertIndex: number) => {
  const { events } = context;
  const game = new Game(context);
  const player = game.actingPlayer;

  if (insertIndex < 0 || insertIndex >= game.drawPileSize) {
    console.error('Invalid insert index:', insertIndex);
    return;
  }

  const defuseCard = player.removeCard(DEFUSE.name);
  const explodingKittenCard = player.removeCard(EXPLODING_KITTEN.name);

  if (!defuseCard || !explodingKittenCard) {
    console.error('Player does not have required card-types to defuse Exploding Kitten');
    // should not happen given game flow, but just in case, eliminate player
    player.eliminate();
    events.endStage();
    events.endTurn();
    return;
  }

  game.discardCard(defuseCard);
  game.insertCardIntoDrawPile(explodingKittenCard, insertIndex);

  events.endStage();
  events.endTurn();
};
