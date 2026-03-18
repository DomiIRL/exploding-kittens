import {FnContext} from '../models';
import {GameLogic} from '../wrappers/game-logic';

/**
 * Mark the lobby as ready to start
 * This should be called when all players have joined
 */
export const setLobbyReady = (context: FnContext) => {
  const game = new GameLogic(context);
  game.lobbyReady = true;
};

