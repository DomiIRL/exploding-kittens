import './Board.css';
import Table from './table/Table';
import PlayerList from './player/player-list/PlayerList';
import BoardOverlays from './overlay/BoardOverlays.tsx';
import GameStatusList from './game-status/GameStatusList';
import {useEffect} from 'react';
import {Chat} from '../chat/Chat';
import {useMatchDetails} from "../../context/MatchDetailsContext.tsx";
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

  const { setPollingInterval } = useMatchDetails();

  useEffect(() => {
    setPollingInterval(game.isLobbyPhase() ? 500 : 3000);
  }, [game.isLobbyPhase(), setPollingInterval]);

  useEffect(() => {
    if (!game.piles.pendingCard || !game.piles.pendingCard || !game.moves.resolvePendingCard) {
      return;
    }

    const checkAndResolve = () => {
      if (game.piles.pendingCard && Date.now() >= game.piles.pendingCard.expiresAtMs) {
        game.moves.resolvePendingCard();
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
    game.piles.pendingCard,
    game.piles.pendingCard?.expiresAtMs,
    game.moves,
  ]);

  return (
    <>
      <GameProvider game={game}>
        <div className={`board-container ${game.isSpectator ? 'hand-interactable' : ''} ${!game.selfPlayer?.isAlive ? 'dimmed' : ''} ${game.isLobbyPhase() ? 'pointer-events-none' : ''}`}>
          <div className={"game-elements"}>
            <Table />
            <PlayerList />
          </div>
        </div>

        <BoardOverlays />
        <GameStatusList />
        <Chat />
      </GameProvider>
    </>
  );
}
