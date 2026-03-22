import {TheGame} from "../entities/game";
import {PlayerID} from "boardgame.io";
import {CHOOSE_CARD_TO_GIVE} from "../constants/stages";

/**
 * Request a card from a target player (favor card - first stage)
 */
export const requestCard = (game: TheGame, targetPlayerId: PlayerID) => {
  // Validate target player
  game.players.validateTarget(targetPlayerId);

  // End current player's stage and set the target player to choose a card to give
  game.turnManager.endStage();
  game.turnManager.setActivePlayers({
    value: {
      [targetPlayerId]: CHOOSE_CARD_TO_GIVE,
    },
  });
};

/**
 * Give a card to the requesting player (favor card - second stage)
 */
export const giveCard = (game: TheGame, cardIndex: number) => {
  const {ctx} = game.context;

  // Find who is giving the card (the player in the chooseCardToGive stage)
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    playerId => ctx.activePlayers?.[playerId] === CHOOSE_CARD_TO_GIVE
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



