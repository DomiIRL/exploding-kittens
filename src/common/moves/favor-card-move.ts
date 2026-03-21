import {IContext} from "../models";
import {PlayerID} from "boardgame.io";
import {Game} from "../entities/game";

/**
 * Request a card from a target player (favor card - first stage)
 */
export const requestCard = (context: IContext, targetPlayerId: PlayerID) => {
  const {events} = context;
  const game = new Game(context);

  // Validate target player
  game.validateTarget(targetPlayerId);

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
export const giveCard = (context: IContext, cardIndex: number) => {
  const {ctx, events} = context;
  const game = new Game(context);

  // Find who is giving the card (the player in the chooseCardToGive stage)
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    playerId => ctx.activePlayers?.[playerId] === 'chooseCardToGive'
  );

  if (!givingPlayerId) {
    throw Error('No player is in the card giving stage');
  }

  const givingPlayer = game.getPlayer(givingPlayerId);
  const requestingPlayer = game.currentPlayer;

  // Transfer the card from giving player to requesting player
  givingPlayer.giveCard(cardIndex, requestingPlayer);

  // End all stages
  events.endStage();
};

