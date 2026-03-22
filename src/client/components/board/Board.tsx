import './Board.css';
import {useCardAnimations} from '../../hooks/useCardAnimations';
import {useGameState} from '../../hooks/useGameState';
import {GameContext, PlayerStateBundle} from '../../types/component-props';
import Table from './table/Table';
import PlayerList from './player/player-list/PlayerList';
import BoardOverlays from './overlay/BoardOverlays.tsx';
import LobbyOverlay from './overlay/lobby-overlay/LobbyOverlay';
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
    if (!gameState.isInNowCardStage || !game.piles.pendingCard || !moves.resolvePendingCard) {
      return;
    }

    const checkAndResolve = () => {
      if (game.piles.pendingCard && Date.now() >= game.piles.pendingCard.expiresAtMs) {
        moves.resolvePendingCard();
      }
    };

    const remainingMs = Math.max(0, game.piles.pendingCard.expiresAtMs - Date.now());

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
    game.piles.pendingCard?.expiresAtMs,
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

  // Handle card animations
  const {AnimationLayer} = useCardAnimations(game);

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

        <div className={`board-container ${game.isSpectator ? 'hand-interactable' : ''} ${!game.selfPlayer?.isAlive ? 'dimmed' : ''} ${game.isLobbyPhase() ? 'pointer-events-none' : ''}`}>
          <div className={"game-elements"}>
            <Table />
            <PlayerList />
          </div>
        </div>

        <BoardOverlays />

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
