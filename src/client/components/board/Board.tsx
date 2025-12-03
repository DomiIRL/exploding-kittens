import './Board.css';
import Table from './table/Table';
import Player from './player-area/Player.tsx';
import DebugPanel from './debug-panel/DebugPanel';
import WinnerOverlay from './winner-overlay/WinnerOverlay';
import DeadOverlay from './dead-overlay/DeadOverlay';
import { BoardProps } from 'boardgame.io/react';
import { Card, GameState } from '../../../common';
import PlayerState from '../../model/PlayerState';

interface PlayerPlugin {
  data: {
    players: {
      [key: string]: {
        hand: Card[];
        hand_count: number;
        isAlive: boolean;
      };
    };
  };
}

interface BoardPropsWithPlugins extends BoardProps<GameState> {
  plugins: {
    player: PlayerPlugin;
  };
}

interface Position {
  top: string;
  left: string;
}

interface CardPosition extends Position {
  angle: number;
}

interface Positions {
  cardPosition: CardPosition;
  infoPosition: Position;
}

export default function ExplodingKittensBoard({
  ctx, 
  G, 
  moves,
  plugins, 
  playerID
}: BoardPropsWithPlugins) {
  const players = Object.keys(ctx.playOrder);
  const currentPlayer = parseInt(ctx.currentPlayer);
  const allPlayers = plugins.player.data.players;
  const isSpectator = playerID == null;
  const selfPlayerId = isSpectator ? null : parseInt(playerID || '0');
  const isGameOver = ctx.phase === 'gameover';
  const winner = G.winner;

  // Check if the current player is dead
  const isSelfDead = !isSpectator && selfPlayerId !== null && !allPlayers[selfPlayerId.toString()].isAlive;

  // Filter alive players
  const alivePlayers = players.filter(player => allPlayers[player].isAlive);

  // Find index of self player among alive players
  const alivePlayersSorted = [...alivePlayers].sort((a, b) => parseInt(a) - parseInt(b));
  const selfIndexInAlivePlayers = selfPlayerId !== null
    ? alivePlayersSorted.findIndex(p => parseInt(p) === selfPlayerId)
    : 0;

  const getPositions = (aliveIndex: number, numAlivePlayers: number): Positions => {
    const angleStep = 360 / numAlivePlayers;
    const relativePosition = (aliveIndex - selfIndexInAlivePlayers + numAlivePlayers) % numAlivePlayers;
    const angle = 180 + (relativePosition * angleStep);
    const radian = (angle * Math.PI) / 180;

    const cardRadius = 'min(35vw, 35vh)';
    const cardPosition: CardPosition = {
      top: `calc(50% - ${cardRadius} * ${Math.cos(radian)})`,
      left: `calc(50% + ${cardRadius} * ${Math.sin(radian)})`,
      angle: angle - 90,
    };

    const tableRadius = 'min(45vw, 45vh)';
    const infoPosition: Position = {
      top: `calc(50% - ${tableRadius} * ${Math.cos(radian)})`,
      left: `calc(50% + ${tableRadius} * ${Math.sin(radian)})`,
    };

    return { cardPosition, infoPosition };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-200">
      <div className={`board-container ${isSpectator ? 'hand-interactable' : ''} ${isSelfDead ? 'dimmed' : ''}`}>
        <Table G={G} moves={moves} />
        {alivePlayersSorted.map((player, index) => {
          const { cardPosition, infoPosition } = getPositions(index, alivePlayers.length);
          const playerNumber = parseInt(player);
          const isSelf = selfPlayerId != null && playerNumber === selfPlayerId;
          const playerInfo = allPlayers[player];
          const isAlive = playerInfo.isAlive;
          const isTurn = playerNumber == currentPlayer;
          const handCount = playerInfo.hand_count;
          const hand = playerInfo.hand

          const playerState = new PlayerState(isSpectator, isSelf, isAlive, isTurn, handCount, hand)

          return (
            <Player
              key={player}
              playerID={player}
              playerState={playerState}
              cardPosition={cardPosition}
              infoPosition={infoPosition}
              moves={moves}
            />
          );
        })}
      </div>
      {isSelfDead && !isGameOver && (
        <DeadOverlay />
      )}
      {isGameOver && winner && (
        <WinnerOverlay winnerID={winner} playerID={playerID} />
      )}
      <DebugPanel data={{ ctx, G, moves, plugins, playerID }} />
    </div>
  );
}

