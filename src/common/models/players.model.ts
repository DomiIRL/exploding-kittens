import type {Player} from './player.model';

export interface Players {
  [playerID: string]: Player;
}
