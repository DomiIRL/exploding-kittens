import {PluginPlayer} from 'boardgame.io/dist/cjs/plugins.js';
import {createPlayerState, filterPlayerView} from '../setup/player-setup';
import type {Plugin} from 'boardgame.io';
import type {GameState} from '../models';

export const createPlayerPlugin = (): Plugin => {
  const basePlugin = PluginPlayer({
    setup: createPlayerState,
  });

  // Wrap the playerView to access G from the State
  return {
    ...basePlugin,
    playerView: ({G, data, playerID}: {G: GameState, data: any, playerID?: string | null}) => {
      // Use our custom filterPlayerView that has access to G
      const filteredPlayers = filterPlayerView(G, data.players, playerID ?? null);
      return { players: filteredPlayers };
    },
  };
};

