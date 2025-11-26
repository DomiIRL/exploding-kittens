import {PlayerAPI} from "./PlayerAPI";

export type PluginAPIs = Record<string, unknown> & {
  player: PlayerAPI;
};
