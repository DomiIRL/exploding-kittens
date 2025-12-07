import {useMemo} from 'react';
import {Ctx} from 'boardgame.io';
import {GameState} from '../../common';

interface PlayerData {
  [key: string]: {
    hand: any[];
    hand_count: number;
    isAlive: boolean;
  };
}

interface GameStateData {
  isSpectator: boolean;
  selfPlayerId: number | null;
  isSelfDead: boolean;
  isSelfSpectator: boolean;
  isGameOver: boolean;
  currentPlayer: number;
  isSelectingPlayer: boolean;
  isChoosingCardToGive: boolean;
  alivePlayers: string[];
  alivePlayersSorted: string[];
}

/**
 * Hook to derive and memoize game state properties
 */
export const useGameState = (
  ctx: Ctx,
  G: GameState,
  allPlayers: PlayerData,
  playerID: string | null
): GameStateData => {
  const isSpectator = playerID == null;
  const selfPlayerId = isSpectator ? null : parseInt(playerID || '0');

  const isSelfDead = useMemo(() => {
    return !isSpectator &&
      selfPlayerId !== null &&
      !allPlayers[selfPlayerId.toString()]?.isAlive;
  }, [isSpectator, selfPlayerId, allPlayers]);

  const isSelfSpectator = useMemo(() => {
    return isSpectator ||
      (isSelfDead && G.gameRules.deadPlayersCanSeeAllCards) ||
      G.gameRules.openCards;
  }, [isSpectator, isSelfDead, G.gameRules]);

  const isGameOver = ctx.phase === 'gameover';
  const currentPlayer = parseInt(ctx.currentPlayer);

  const isSelectingPlayer = useMemo(() => {
    const stage = ctx.activePlayers?.[playerID || ''];
    return !isSpectator &&
      selfPlayerId !== null &&
      selfPlayerId === currentPlayer &&
      (stage === 'choosePlayerToStealFrom' || stage === 'choosePlayerToRequestFrom');
  }, [isSpectator, selfPlayerId, currentPlayer, ctx.activePlayers, playerID]);

  const isChoosingCardToGive = useMemo(() => {
    return !isSpectator &&
      selfPlayerId !== null &&
      ctx.activePlayers?.[playerID || ''] === 'chooseCardToGive';
  }, [isSpectator, selfPlayerId, ctx.activePlayers, playerID]);

  const alivePlayers = useMemo(() => {
    return Object.keys(ctx.playOrder).filter(player => allPlayers[player]?.isAlive);
  }, [ctx.playOrder, allPlayers]);

  const alivePlayersSorted = useMemo(() => {
    return [...alivePlayers].sort((a, b) => parseInt(a) - parseInt(b));
  }, [alivePlayers]);

  return {
    isSpectator,
    selfPlayerId,
    isSelfDead,
    isSelfSpectator,
    isGameOver,
    currentPlayer,
    isSelectingPlayer,
    isChoosingCardToGive,
    alivePlayers,
    alivePlayersSorted,
  };
};

