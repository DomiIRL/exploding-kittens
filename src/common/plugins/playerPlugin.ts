import { PluginPlayer } from 'boardgame.io/dist/cjs/plugins.js';
import { createPlayerState, filterPlayerView } from '../setup/playerSetup';

export const createPlayerPlugin = () => {
  return PluginPlayer({
    setup: createPlayerState,
    playerView: filterPlayerView,
  });
};

