import {IContext} from '../models';
import {TheGame} from '../entities/game';

/**
 * Mark the lobby as ready to start
 * This should be called when all players have joined
 */
export const setLobbyReady = (context: IContext) => {
  const game = new TheGame(context);
  game.lobbyReady = true;
};

