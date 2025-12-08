import './TurnsOverlay.css';

interface TurnsOverlayProps {
  turnsRemaining: number;
  isCurrentPlayer: boolean;
}

/**
 * Visual overlay showing how many turns the current player has remaining
 * Prominently displayed when player has multiple turns (attacked)
 */
export default function TurnsOverlay({ turnsRemaining, isCurrentPlayer }: TurnsOverlayProps) {
  // Don't show anything if only 1 turn remaining (normal gameplay)
  if (turnsRemaining <= 1) {
    return null;
  }

  return (
    <div className={`turns-overlay ${isCurrentPlayer ? 'is-self' : 'is-other'}`}>
      <div className="turns-overlay-content">
        <div className="turns-overlay-icon">⚔️</div>
        <div className="turns-overlay-text">
          <div className="turns-overlay-count">{turnsRemaining}</div>
          <div className="turns-overlay-label">
            Turns Left
          </div>
        </div>
      </div>
      {isCurrentPlayer && (
        <div className="turns-overlay-message">
          You were attacked! Complete {turnsRemaining} turns.
        </div>
      )}
    </div>
  );
}

