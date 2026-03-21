import type {IGameState} from "./game-state.model";
import {Ctx} from "boardgame.io";
import {IPlayerAPI} from "./player-api.model";
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {EventsAPI} from "boardgame.io/dist/types/src/plugins/events/events";

export type IContext = Record<string, unknown> & {
  G: IGameState;
  ctx: Ctx;
  player: IPlayerAPI;
  events: EventsAPI;
  random: RandomAPI;
  playerID?: string;
};
