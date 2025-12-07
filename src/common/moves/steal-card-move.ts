import type {FnContext} from "../models";
import type {PlayerID} from "boardgame.io";
import {validateTargetPlayer, transferCard} from "./card-transfer-utils";

export const stealCard = (context: FnContext, targetPlayerId: PlayerID) => {
  const {ctx, events, random} = context;

  // Validate target player
  const targetPlayerData = validateTargetPlayer(context, targetPlayerId);

  // Pick a random card from target player
  const randomIndex = random.Die(targetPlayerData.hand.length) - 1;

  // Transfer the card from target to current player
  transferCard(context, targetPlayerId, ctx.currentPlayer, randomIndex);

  events.endStage();
};

