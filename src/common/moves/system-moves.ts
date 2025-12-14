import type {FnContext} from '../models';

/**
 * Mark the lobby as ready to start
 * This should be called when all players have joined
 */
export const setLobbyReady = ({G}: FnContext) => {
  G.lobbyReady = true;
};

