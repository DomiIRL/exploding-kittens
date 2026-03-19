import './Board.css';
import {BoardProps} from 'boardgame.io/react';
import {GameState} from '../../../common';
import {useCardAnimations} from '../../hooks/useCardAnimations';
import {useExplosionEvents} from '../../hooks/useExplosionEvents';
import {useGameState} from '../../hooks/useGameState';
import {BoardPlugins} from '../../models/client.model';
import {GameContext, PlayerStateBundle, OverlayStateBundle} from '../../types/component-props';
import Table from './table/Table';
import PlayerList from './player-list/PlayerList';
import OverlayManager from './overlay-manager/OverlayManager';
import LobbyOverlay from './lobby-overlay/LobbyOverlay';
import GameStatusList from './game-status/GameStatusList';
import {useEffect} from 'react';
import { useMatchDetails } from '../../context/MatchDetailsContext';

interface BoardPropsWithPlugins extends BoardProps<GameState> {
  plugins: BoardPlugins;
  matchData?: any;
  matchName?: string;
  numPlayers?: number;
}

/**
 * Main game board component
 */
export default function ExplodingKittensBoard({
  ctx,
  G,
  moves,
  plugins,
  playerID,
  matchID,
  matchData,
  matchName,
  numPlayers
}: BoardPropsWithPlugins) {
  const { matchDetails } = useMatchDetails();
  
  const allPlayers = plugins.player.data.players;

  // Bundle game context
  const gameContext: GameContext = {
    ctx,
    G,
    moves,
    playerID,
    matchData: matchDetails?.players
  };

  // Derive game state properties
  const gameState = useGameState(ctx, G, allPlayers, playerID);
  
  const selfPlayer = gameState.selfPlayerId !== null && allPlayers[gameState.selfPlayerId] ? allPlayers[gameState.selfPlayerId] : null;
  const selfHand = selfPlayer ? selfPlayer.hand : [];

  useEffect(() => {
    if (!gameState.isAwaitingNowCardResolution || !G.pendingCardPlay || !moves.resolvePendingCard) {
      return;
    }

    const remainingMs = Math.max(0, G.pendingCardPlay.expiresAtMs - Date.now());
    const timeoutId = window.setTimeout(() => {
      moves.resolvePendingCard();
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    gameState.isAwaitingNowCardResolution,
    G.pendingCardPlay?.expiresAtMs,
    moves,
  ]);

  // Bundle player state
  const playerState: PlayerStateBundle = {
    allPlayers,
    selfPlayerId: gameState.selfPlayerId,
    currentPlayer: gameState.currentPlayer,
    isSelfDead: gameState.isSelfDead,
    isSelfSpectator: gameState.isSelfSpectator,
    isSelfTurn: gameState.selfPlayerId === gameState.currentPlayer
  };

  // Bundle overlay state
  const overlayState: OverlayStateBundle = {
    isSelectingPlayer: gameState.isSelectingPlayer,
    isChoosingCardToGive: gameState.isChoosingCardToGive,
    isViewingFuture: gameState.isViewingFuture,
    isGameOver: gameState.isGameOver
  };

  // Handle card animations
  const {AnimationLayer, triggerCardMovement} = useCardAnimations(G, allPlayers, playerID);

  // Handle explosion/defuse events
  const explosion = useExplosionEvents(G, allPlayers, playerID, matchData);


  /**
   * Handle player selection for stealing/requesting a card
   */
  const handlePlayerSelect = (targetPlayerId: string) => {
    if (!gameState.isSelectingPlayer) return;

    // Check which stage we're in and call the appropriate move
    const stage = ctx.activePlayers?.[playerID || ''];
    if (stage === 'choosePlayerToStealFrom' && moves.stealCard) {
      moves.stealCard(targetPlayerId);
    } else if (stage === 'choosePlayerToRequestFrom' && moves.requestCard) {
      moves.requestCard(targetPlayerId);
    }
  };

  /**
   * Handle card selection when giving a card (favor card)
   */
  const handleCardGive = (cardIndex: number) => {
    if (gameState.isChoosingCardToGive && moves.giveCard) {
      moves.giveCard(cardIndex);
    }
  };

  /**
   * Handle closing the see the future overlay
   */
  const handleCloseFutureView = () => {
    if (gameState.isViewingFuture && moves.closeFutureView) {
      moves.closeFutureView();
    }
  };

  // Check if we're in lobby phase
  const isInLobby = ctx.phase === 'lobby';


  /**
   * Handle starting the game from lobby
   */
  const handleStartGame = () => {
    if (moves.startGame) {
      moves.startGame();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-200">
      <div className={`board-container ${playerState.isSelfSpectator ? 'hand-interactable' : ''} ${playerState.isSelfDead ? 'dimmed' : ''} ${isInLobby ? 'pointer-events-none' : ''}`}>
        <div className={"game-elements"}>
          <Table gameContext={gameContext} playerHand={selfHand} />

          <PlayerList
            alivePlayersSorted={gameState.alivePlayersSorted}
            playerState={playerState}
            overlayState={overlayState}
            isInNowCardStage={gameState.isInNowCardStage}
            animationCallbacks={{triggerCardMovement}}
            interactionHandlers={{
              onPlayerSelect: handlePlayerSelect,
              onCardGive: handleCardGive
            }}
            gameContext={gameContext}
          />
        </div>
      </div>

      <GameStatusList
        matchID={matchData?.matchID || matchID}
        matchName={matchName || matchDetails?.matchName || 'Game'} // Prefer prop, then context
        numPlayers={numPlayers || ctx.numPlayers}
        gameContext={gameContext}
        playerState={playerState}
      />

      <AnimationLayer />

      <OverlayManager
        gameContext={gameContext}
        playerState={playerState}
        overlayState={overlayState}
        explosionEvent={{
          event: explosion.event,
          playerName: explosion.playerName,
          isSelf: explosion.isSelf,
          onComplete: explosion.clearEvent
        }}
        winnerID={G.winner}
        onCloseFutureView={handleCloseFutureView}
      />

      {isInLobby && (
        <LobbyOverlay
          matchData={matchData}
          numPlayers={ctx.numPlayers}
          onStartGame={handleStartGame}
        />
      )}
    </div>
  );
}
