import {IContext} from "../models";
import {PlayerID} from "boardgame.io";
import {TheGame} from "../entities/game";

/**
 * Request a card from a target player (favor card - first stage)
 */
export const requestCard = (context: IContext, targetPlayerId: PlayerID) => {
  const game = new TheGame(context);

  // Validate target player
  game.players.validateTarget(targetPlayerId);

  // End current player's stage and set the target player to choose a card to give
  game.turnManager.endStage();
  game.turnManager.setActivePlayers({
    value: {
      [targetPlayerId]: 'chooseCardToGive',
    },
  });
};

/**
 * Give a card to the requesting player (favor card - second stage)
 */
export const giveCard = (context: IContext, cardIndex: number) => {
  const {ctx} = context;
  const game = new TheGame(context);

  // Find who is giving the card (the player in the chooseCardToGive stage)
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    playerId => ctx.activePlayers?.[playerId] === 'chooseCardToGive'
  );

  if (!givingPlayerId) {
    throw Error('No player is in the card giving stage');
  }

  const givingPlayer = game.players.getPlayer(givingPlayerId);
  const requestingPlayer = game.players.currentPlayer;

  // Transfer the card from giving player to requesting player
  givingPlayer.giveCard(cardIndex, requestingPlayer);

  // End all stages
  game.turnManager.endStage();
};



