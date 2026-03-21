import type {IPlayers} from './players.model';
import {IPlayer} from "./player.model";

export interface IPlayerAPI {
  state: IPlayers;
  get(): IPlayer;
  set(value: IPlayer): IPlayer;
}
