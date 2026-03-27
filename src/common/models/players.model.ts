import type {IPlayer} from './player.model';
import type {PlayerID} from 'boardgame.io';

export interface IPlayers {
  [playerID: PlayerID]: IPlayer;
}
