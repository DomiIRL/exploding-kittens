import './TurnBadge.css';

interface TurnBadgeProps {
  turnsRemaining: number;
  isCurrentPlayer: boolean;
}

/**
 * Visual badge showing how many turns the current player has remaining
 * Prominently displayed when player has multiple turns (attacked)
 */
export default function TurnBadge({ turnsRemaining, isCurrentPlayer }: TurnBadgeProps) {
  // Don't show anything if only 1 turn remaining (normal gameplay)
  if (turnsRemaining <= 1) {
    return null;
  }

  return (
    <div className={`turn-badge ${isCurrentPlayer ? 'is-self' : 'is-other'}`}>
      <div className="turn-badge-content">
        <div className="turn-badge-icon">⚔️</div>
        <div className="turn-badge-text">
          <div className="turn-badge-count">{turnsRemaining}</div>
          <div className="turn-badge-label">
            Turns Left
          </div>
        </div>
      </div>
      {isCurrentPlayer && (
        <div className="turn-badge-message">
          You were attacked! Complete {turnsRemaining} turns.
        </div>
      )}
    </div>
  );
}
