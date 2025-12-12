import './WinnerOverlay.css';
import {MatchPlayer, getPlayerName} from '../../../utils/matchData';

interface WinnerOverlayProps {
  winnerID: string;
  playerID: string | null;
  matchData?: MatchPlayer[];
}

export default function WinnerOverlay({winnerID, playerID, matchData}: WinnerOverlayProps) {
  const isWinner = playerID === winnerID;
  const winnerName = getPlayerName(winnerID, matchData);

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <div className="winner-trophy">🏆</div>
        <div className="winner-title">Game Over!</div>
        <div className="winner-name">
          {isWinner ? 'You Win!' : `${winnerName} Wins!`}
        </div>
        <div className="winner-subtitle">
          {isWinner
            ? 'Congratulations!'
            : 'Better luck next time!'}
        </div>
      </div>
    </div>
  );
}

