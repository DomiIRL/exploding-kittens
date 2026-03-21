import {IPlayer} from '../../common';

/**
 * Type definitions for the client
 */

export interface IPlayerPlugin {
  data: {
    players: {
      [key: string]: IPlayer
    };
  };
}

export interface IBoardPlugins {
  [pluginName: string]: any;
  player: IPlayerPlugin;
}

