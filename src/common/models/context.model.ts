import type {GameState} from "./game-state.model";
import {Ctx} from "boardgame.io";
import {PlayerAPI} from "./player-api.model";
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {EventsAPI} from "boardgame.io/dist/types/src/plugins/events/events";

export type FnContext = Record<string, unknown> & {
  G: GameState;
  ctx: Ctx;
  player: PlayerAPI;
  events: EventsAPI; // TODO: Define proper type for events
  random: RandomAPI;
  playerID?: string;
};
