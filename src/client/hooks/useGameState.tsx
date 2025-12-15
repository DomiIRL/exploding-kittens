import {useMemo} from 'react';
import {Ctx} from 'boardgame.io';
import {GameState, Players} from '../../common';

interface GameStateData {
  isSpectator: boolean;
  selfPlayerId: number | null;
  isSelfDead: boolean;
  isSelfSpectator: boolean;
  isGameOver: boolean;
  currentPlayer: number;
  isSelectingPlayer: boolean;
  isChoosingCardToGive: boolean;
  isViewingFuture: boolean;
  alivePlayers: string[];
  alivePlayersSorted: string[];
}

/**
 * Hook to derive and memoize game state properties
 */
export const useGameState = (
  ctx: Ctx,
  G: GameState,
  allPlayers: Players,
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
      (isSelfDead && !G.gameRules.spectatorsCardsHidden) ||
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

  const isViewingFuture = useMemo(() => {
    return !isSpectator &&
      selfPlayerId !== null &&
      ctx.activePlayers?.[playerID || ''] === 'viewingFuture';
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
    isViewingFuture,
    alivePlayers,
    alivePlayersSorted,
  };
};

