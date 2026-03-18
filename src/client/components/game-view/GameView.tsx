import {useState} from 'react';
import './GameView.css';

interface GameViewProps {
  matchID: string;
  matchName?: string;
  numPlayers?: number;
  onLeave: () => void;
  children: React.ReactNode;
}

export default function GameView({onLeave, children}: GameViewProps) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleLeaveClick = () => {
    setShowLeaveModal(true);
  };

  const confirmLeave = async () => {
    setShowLeaveModal(false);
    onLeave();
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
  };

  return (
    <div className="game-view-container">
      <button className="leave-button" onClick={handleLeaveClick}>
        <span>←</span>
        <span>Leave Match</span>
      </button>

      {children}

      {showLeaveModal && (
        <div className="leave-modal-overlay" onClick={cancelLeave}>
          <div className="leave-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="leave-modal-icon">⚠️</div>
            <h3 className="leave-modal-title">Leave Match?</h3>
            <p className="leave-modal-text">
              Are you sure you want to leave this match? You can rejoin later if the match is still active.
            </p>
            <div className="leave-modal-actions">
              <button className="btn btn-secondary" onClick={cancelLeave}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmLeave}>
                Leave Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
