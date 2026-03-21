import type {IPlayer} from './player.model';

export interface IPlayers {
  [playerID: string]: IPlayer;
}
