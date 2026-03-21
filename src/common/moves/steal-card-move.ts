import {IContext} from "../models";
import {PlayerID} from "boardgame.io";
import {Game} from "../entities/game";

export const stealCard = (context: IContext, targetPlayerId: PlayerID) => {
  const {events, random} = context;
  const game = new Game(context);

  // Validate target player
  const targetPlayer = game.validateTarget(targetPlayerId);

  // Pick a random card index from target player's hand
  const randomIndex = Math.floor(random.Number() * targetPlayer.getCardCount());

  // Transfer the card from target to current player
  targetPlayer.giveCard(randomIndex, game.currentPlayer);

  events.endStage();
};

