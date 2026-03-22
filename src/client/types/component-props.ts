import {Ctx} from 'boardgame.io';
import {IGameState, IPlayers} from '../../common';
import {MatchPlayer} from '../utils/matchData';

/**
 * Game context bundle - contains boardgame.io state
 */
export interface GameContext {
  ctx: Ctx;
  G: IGameState;
  moves: any;
  playerID: string | null;
  matchData?: MatchPlayer[];
}

/**
 * Player state bundle - contains player-specific state
 */
export interface PlayerStateBundle {
  allPlayers: IPlayers;
  selfPlayerId: number | null;
  currentPlayer: number;
  isSelfDead: boolean;
  isSelfSpectator: boolean;
  isSelfTurn: boolean;
}

/**
 * Position data for player rendering
 */
export interface PlayerPosition {
  cardPosition: {
    top: string;
    left: string;
    angle: number;
  };
  infoPosition: {
    top: string;
    left: string;
  };
}

