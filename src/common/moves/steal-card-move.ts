import {FnContext} from "../models";
import {PlayerID} from "boardgame.io";
import {GameLogic} from "../wrappers/game-logic";

export const stealCard = (context: FnContext, targetPlayerId: PlayerID) => {
  const {events, random} = context;
  const game = new GameLogic(context);

  // Validate target player
  const targetPlayer = game.validateTarget(targetPlayerId);

  // Pick a random card index from target player's hand
  const randomIndex = Math.floor(random.Number() * targetPlayer.getCardCount());

  // Transfer the card from target to current player
  targetPlayer.giveCard(randomIndex, game.currentPlayer);

  events.endStage();
};

