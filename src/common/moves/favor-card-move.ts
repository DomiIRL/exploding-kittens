import type {FnContext} from "../models";
import type {PlayerID} from "boardgame.io";
import {validateTargetPlayer, transferCard} from "./card-transfer-utils";

/**
 * Request a card from a target player (favor card - first stage)
 */
export const requestCard = (context: FnContext, targetPlayerId: PlayerID) => {
  const {events} = context;

  // Validate target player
  validateTargetPlayer(context, targetPlayerId);

  // End current player's stage and set the target player to choose a card to give
  events.endStage();

  // Set target player to choose a card to give
  events.setActivePlayers({
    value: {
      [targetPlayerId]: 'chooseCardToGive',
    },
  });
};

/**
 * Give a card to the requesting player (favor card - second stage)
 */
export const giveCard = (context: FnContext, cardIndex: number) => {
  const {ctx, events} = context;

  // Find who is giving the card (the player in the chooseCardToGive stage)
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    playerId => ctx.activePlayers?.[playerId] === 'chooseCardToGive'
  );

  if (!givingPlayerId) {
    throw Error('No player is in the card giving stage');
  }

  // The requesting player is the one whose turn it is
  const requestingPlayerId = ctx.currentPlayer;

  // Transfer the card from giving player to requesting player
  transferCard(context, givingPlayerId, requestingPlayerId, cardIndex);

  // End all stages
  events.endStage();
};

