import type {Players} from './players.model';
import {Player} from "./player.model";

export interface PlayerAPI {
  state: Players;
  get(): Player;
  set(value: Player): Player;
}
