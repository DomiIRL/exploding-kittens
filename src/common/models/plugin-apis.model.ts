import type { PlayerAPI } from './player-api.model';

export type PluginAPIs = Record<string, unknown> & {
  player: PlayerAPI;
};
