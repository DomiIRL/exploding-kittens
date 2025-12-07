import {Player} from '../../common';

/**
 * Type definitions for the client
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

