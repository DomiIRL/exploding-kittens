import type {IPlayerAPI} from './player-api.model';

export type IPluginAPIs = Record<string, unknown> & {
  player: IPlayerAPI;
};
