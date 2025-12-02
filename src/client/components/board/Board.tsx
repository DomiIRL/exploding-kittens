import './Board.css';
import Table from './table/Table';
import PlayerArea from './player-area/PlayerArea';
import DebugPanel from './debug-panel/DebugPanel';
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
  const allPlayers = plugins.player.data.players;
  const currentPlayerNumber = parseInt(playerID || '0');

  const getPositions = (index: number, playerID: number): Positions => {
    const numPlayers = ctx.numPlayers;
    const angleStep = 360 / numPlayers;
    const relativePosition = (index - playerID + numPlayers) % numPlayers;
    const angle = 180 + (relativePosition * angleStep);
    const radian = (angle * Math.PI) / 180;

    const cardRadius = 'min(30vw, 30vh)';
    const cardPosition: CardPosition = {
      top: `calc(50% - ${cardRadius} * ${Math.cos(radian)})`,
      left: `calc(50% + ${cardRadius} * ${Math.sin(radian)})`,
      angle: angle - 90,
    };

    const tableRadius = 'min(43vw, 43vh)';
    const infoPosition: Position = {
      top: `calc(50% - ${tableRadius} * ${Math.cos(radian)})`,
      left: `calc(50% + ${tableRadius} * ${Math.sin(radian)})`,
    };

    return { cardPosition, infoPosition };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-200">
      <div className="board-container">
        <Table />
        {players.map((player, index) => {
          const { cardPosition, infoPosition } = getPositions(index, currentPlayerNumber);
          const isSelf = parseInt(player) === currentPlayerNumber;
          const playerInfo = allPlayers[player];
          const isAlive = playerInfo.isAlive;
          const handCount = playerInfo.hand_count;
          const hand = playerInfo.hand

          const playerState = new PlayerState(isSelf, isAlive, handCount, hand)

          return (
            <PlayerArea
              key={player}
              playerID={player}
              playerState={playerState}
              cardPosition={cardPosition}
              infoPosition={infoPosition}
            />
          );
        })}
      </div>
      <DebugPanel data={{ ctx, G, moves, plugins, playerID }} />
    </div>
  );
}

