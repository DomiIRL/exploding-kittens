/**
 * Bundled prop types for cleaner component interfaces
 * This reduces prop drilling and makes the codebase easier to maintain
 */

import {Ctx} from 'boardgame.io';
import {GameState, Players, Card} from '../../common';
import {MatchPlayer} from '../utils/matchData';

/**
 * Game context bundle - contains boardgame.io state
 */
export interface GameContext {
  ctx: Ctx;
  G: GameState;
  moves: any;
  playerID: string | null;
  matchData?: MatchPlayer[];
}

/**
 * Player state bundle - contains player-specific state
 */
export interface PlayerStateBundle {
  allPlayers: Players;
  selfPlayerId: number | null;
  currentPlayer: number;
  isSelfDead: boolean;
  isSelfSpectator: boolean;
  isSelfTurn: boolean;
}

/**
 * Overlay state bundle - contains all overlay visibility flags
 */
export interface OverlayStateBundle {
  isSelectingPlayer: boolean;
  isChoosingCardToGive: boolean;
  isViewingFuture: boolean;
  isGameOver: boolean;
}

/**
 * Explosion event bundle - contains explosion/defuse event data
 */
export interface ExplosionEventBundle {
  event: 'exploding' | 'defused' | null;
  playerName: string;
  isSelf: boolean;
  onComplete: () => void;
}

/**
 * Animation callbacks bundle - contains animation-related functions
 */
export interface AnimationCallbacks {
  triggerCardMovement: (card: Card | null, fromId: string, toId: string) => void;
}

/**
 * Player interaction bundle - contains player selection/interaction handlers
 */
export interface PlayerInteractionHandlers {
  onPlayerSelect: (playerId: string) => void;
  onCardGive: (cardIndex: number) => void;
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

