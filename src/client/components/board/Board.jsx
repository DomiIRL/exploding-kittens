import React from 'react';
import './Board.css';
import Table from './components/Table.jsx';
import PlayerArea from './components/PlayerArea.jsx';
import DebugPanel from './components/DebugPanel.jsx';

export default function ExplodingKittensBoard({ ctx, G, moves, plugins, playerID }) {
  const players = Object.keys(ctx.playOrder);
  const allPlayers = plugins.player.data.players;
  const currentPlayerNumber = parseInt(playerID);

  const getPositions = (index, playerID) => {
    const numPlayers = ctx.numPlayers;
    const angleStep = 360 / numPlayers;
    const relativePosition = (index - playerID + numPlayers) % numPlayers;
    const angle = 180 + (relativePosition * angleStep);
    const radian = (angle * Math.PI) / 180;

    const cardRadius = 'min(30vw, 30vh)';
    const cardPosition = {
      top: `calc(50% - ${cardRadius} * ${Math.cos(radian)})`,
      left: `calc(50% + ${cardRadius} * ${Math.sin(radian)})`,
      angle: angle - 90,
    };

    const tableRadius = 'min(43vw, 43vh)';
    const infoPosition = {
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
            const isCurrent = parseInt(player) === currentPlayerNumber;
            const handCount = allPlayers[player].hand_count;

            return (
                <PlayerArea
                    key={player}
                    playerID={player}
                    handCount={handCount}
                    isCurrent={isCurrent}
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
