import './Board.css';
import {BoardProps} from 'boardgame.io/react';
import {GameState} from '../../../common';
import {useCardAnimations} from '../../hooks/useCardAnimations';
import {useGameState} from '../../hooks/useGameState';
import {BoardPlugins} from '../../models/client.model';
import {GameContext, PlayerStateBundle, OverlayStateBundle} from '../../types/component-props';
import Table from './table/Table';
import PlayerList from './player-list/PlayerList';
import OverlayManager from './overlay-manager/OverlayManager';
import LobbyOverlay from './lobby-overlay/LobbyOverlay';
import GameStatusList from './game-status/GameStatusList';
import {useEffect} from 'react';
import {Chat} from '../chat/Chat';
import {useMatchDetails} from "../../context/MatchDetailsContext.tsx";

type BoardPropsWithPlugins = Omit<BoardProps<GameState>, 'plugins'> & {
  plugins: BoardPlugins;
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
  chatMessages,
  sendChatMessage
}: BoardPropsWithPlugins) {
  const { matchDetails, setPollingInterval } = useMatchDetails();

  const isInLobby = ctx.phase === 'lobby';

  useEffect(() => {
    setPollingInterval(isInLobby ? 500 : 3000);
  }, [isInLobby, setPollingInterval]);

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
    if (!gameState.isInNowCardStage || !G.pendingCardPlay || !moves.resolvePendingCard) {
      return;
    }

    const checkAndResolve = () => {
      if (G.pendingCardPlay && Date.now() >= G.pendingCardPlay.expiresAtMs) {
        moves.resolvePendingCard();
      }
    };

    const remainingMs = Math.max(0, G.pendingCardPlay.expiresAtMs - Date.now());
    
    // Primary trigger
    const timeoutId = window.setTimeout(checkAndResolve, remainingMs);

    // Fallback interval (poller) ensure resolution happens even if timeout is missed
    const intervalId = window.setInterval(checkAndResolve, 100);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [
    gameState.isInNowCardStage,
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

  /**
   * Handle starting the game from lobby
   */
  const handleStartGame = () => {
    if (moves.startGame) {
      moves.startGame();
    }
  };

  return (
    <>
      <AnimationLayer />

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

      <OverlayManager
        gameContext={gameContext}
        playerState={playerState}
        overlayState={overlayState}
        winnerID={G.winner}
        onCloseFutureView={handleCloseFutureView}
      />

      {isInLobby && (
        <LobbyOverlay
          playerID={playerID}
          onStartGame={handleStartGame}
        />
      )}

      <GameStatusList
        gameContext={gameContext}
        playerState={playerState}
      />
      
      <Chat
        playerID={playerID}
        chatMessages={chatMessages}
        sendChatMessage={sendChatMessage}
      />
    </>
  );
}
