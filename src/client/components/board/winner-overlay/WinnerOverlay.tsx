import './WinnerOverlay.css';

interface WinnerOverlayProps {
  winnerID: string;
  playerID: string | null;
}

export default function WinnerOverlay({winnerID, playerID}: WinnerOverlayProps) {
  const winnerNumber = parseInt(winnerID) + 1;
  const isWinner = playerID === winnerID;

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <div className="winner-trophy">🏆</div>
        <div className="winner-title">Game Over!</div>
        <div className="winner-name">
          {isWinner ? 'You Win!' : `Player ${winnerNumber} Wins!`}
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

