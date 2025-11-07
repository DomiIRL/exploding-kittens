import React from 'react';
import PlayerCards from './PlayerCards.jsx';

export default function PlayerArea({ playerID, handCount, isCurrent, cardPosition, infoPosition }) {
  const cardRotation = cardPosition.angle - 90;

  return (
      <>
        <div
            className={`player-cards-container ${isCurrent ? 'current-player' : ''}`}
            style={{
              position: 'absolute',
              top: cardPosition.top,
              left: cardPosition.left,
              transform: `translate(-50%, -50%) rotate(${cardRotation}deg)`,
              zIndex: isCurrent ? 2 : 1,
            }}
        >
          <PlayerCards count={handCount} isCurrentPlayer={isCurrent} />
        </div>

        <div
            className={`player-position ${isCurrent ? 'current-player' : ''}`}
            style={{
              position: 'absolute',
              top: infoPosition.top,
              left: infoPosition.left,
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
            }}
        >
          <div className="player-area flex flex-col items-center">
            <div className="player-hand border-2 border-black bg-white p-2 rounded">
              Hand Cards: {handCount}
            </div>
            <div className="player-id mt-2 font-bold">
              Player {parseInt(playerID) + 1}
              {isCurrent && ' (You)'}
            </div>
          </div>
        </div>
      </>
  );
}
