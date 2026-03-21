import './Board.css';
import {useCardAnimations} from '../../hooks/useCardAnimations';
import {useGameState} from '../../hooks/useGameState';
import {GameContext, PlayerStateBundle, OverlayStateBundle} from '../../types/component-props';
import Table from './table/Table';
import PlayerList from './player-list/PlayerList';
import OverlayManager from './overlay-manager/OverlayManager';
import LobbyOverlay from './lobby-overlay/LobbyOverlay';
import GameStatusList from './game-status/GameStatusList';
import {useEffect} from 'react';
import {Chat} from '../chat/Chat';
import {useMatchDetails} from "../../context/MatchDetailsContext.tsx";
import {IClientContext} from "../../types/client-context.ts";
import type { BoardProps } from 'boardgame.io/react';
import {IContext, IGameState} from "../../../common";
import {TheGameClient} from "../../entities/game-client.ts";
import {GameProvider} from "../../context/GameContext.tsx";

export default function ExplodingKittensBoard(props: BoardProps<IGameState> & { plugins: any }) {

  const context: IContext = {
    G: props.G,
    ctx: props.ctx,
    playerID: props.playerID || undefined,
    matchID: props.matchID,
    events: props.events as IContext['events'],
    random: props.plugins.random,
    player: props.plugins.player,
  };

  const game = new TheGameClient(
    context,
    props.moves,
    props.matchID,
    props.playerID || null,
    props.matchData,
    props.sendChatMessage,
    props.chatMessages,
    props.isMultiplayer
  );

  // Create clientContext from BoardProps
  const clientContext: IClientContext = {
    ...props,
    plugins: props.plugins,
    player: props.plugins?.player?.data || {},
  };

  const {
    ctx,
    G,
    moves,
    playerID,
    chatMessages,
    sendChatMessage
  } = clientContext;
  const { matchDetails, setPollingInterval } = useMatchDetails();

  useEffect(() => {
    setPollingInterval(game.isLobbyPhase() ? 500 : 3000);
  }, [game.isLobbyPhase(), setPollingInterval]);

  // Bundle game context
  const gameContext: GameContext = {
    ctx,
    G,
    moves,
    playerID: playerID ?? null,
    matchData: matchDetails?.players
  };

  // Derive game state properties
  const gameState = useGameState(ctx, G, game.players.players, playerID ?? null);

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
    allPlayers: game.players.players,
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
  const {AnimationLayer, triggerCardMovement} = useCardAnimations(G, game.players.players, playerID ?? null);

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
      <GameProvider game={game}>
        <AnimationLayer />

        <div className={`board-container ${playerState.isSelfSpectator ? 'hand-interactable' : ''} ${playerState.isSelfDead ? 'dimmed' : ''} ${game.isLobbyPhase() ? 'pointer-events-none' : ''}`}>
          <div className={"game-elements"}>
            <Table gameContext={gameContext} />

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

        {game.isLobbyPhase() && (
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
          playerID={playerID ?? null}
          chatMessages={chatMessages}
          sendChatMessage={sendChatMessage}
        />
      </GameProvider>
    </>
  );
}
