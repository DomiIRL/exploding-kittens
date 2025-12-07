import {Player} from '../../common';

/**
 * Type definitions for the Board component
 */

export interface PlayerPlugin {
  data: {
    players: {
      [key: string]: Player
    };
  };
}

export interface BoardPlugins {
  [pluginName: string]: any;
  player: PlayerPlugin;
}

