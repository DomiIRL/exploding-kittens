import React from 'react';
import {useGame} from '../../../../context/GameContext';
import {getPlayerName} from '../../../../utils/matchData';

const WinnerOverlay: React.FC = () => {
  const game = useGame();
  const winner = game.players.winner;

  if (!game.isGameOver() || !winner) return null;

  const winnerName = getPlayerName(winner.id);

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <div className="winner-trophy">🏆</div>
        <div className="winner-title">Game Over!</div>
        <div className="winner-name">
          {game.selfPlayerId === winner.id ? 'You Win!' : `${winnerName} Wins!`}
        </div>
        <div className="winner-subtitle">
          {game.selfPlayerId === winner.id
            ? 'Congratulations!'
            : 'Better luck next time!'}
        </div>
      </div>
    </div>
  );
}

export default WinnerOverlay;
