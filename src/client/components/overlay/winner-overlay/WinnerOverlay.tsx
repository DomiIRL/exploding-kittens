import './WinnerOverlay.css';
import {getPlayerName} from '../../../utils/matchData.ts';
import {useGame} from "../../../context/GameContext.tsx";

export default function WinnerOverlay() {
  const game = useGame();

  const winner = game.players.winner;
  if (!game.isGameOver() || !winner) {
    return null;
  }

  const isSelfWinner = game.selfPlayerId === winner.id;
  const winnerName = getPlayerName(winner.id, game.matchData);

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <div className="winner-trophy">🏆</div>
        <div className="winner-title">Game Over!</div>
        <div className="winner-name">
          {isSelfWinner ? 'You Win!' : `${winnerName} Wins!`}
        </div>
        <div className="winner-subtitle">
          {isSelfWinner
            ? 'Congratulations!'
            : 'Better luck next time!'}
        </div>
      </div>
    </div>
  );
}

