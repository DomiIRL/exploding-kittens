import './TurnBadge.css';
import {useGame} from "../../../context/GameContext.tsx";

/**
 * Visual badge showing how many turns the current player has remaining
 * Prominently displayed when player has multiple turns (attacked)
 */
export default function TurnBadge() {
  const game = useGame();

  const turnsRemaining = (game.turnManager.turnsRemaining || 1) - 1;

  // Don't show anything if only 1 turn remaining (normal gameplay)
  if (turnsRemaining <= 1) {
    return null;
  }

  return (
    <div className={`turn-badge ${game.isSelfCurrentPlayer ? 'is-self' : 'is-other'}`}>
      <div className="turn-badge-content">
        <div className="turn-badge-icon">⚔️</div>
        <div className="turn-badge-text">
          <div className="turn-badge-count">{turnsRemaining}</div>
          <div className="turn-badge-label">
            Turns Left
          </div>
        </div>
      </div>
      {game.isSelfCurrentPlayer && (
        <div className="turn-badge-message">
          You were attacked! Complete {turnsRemaining} turns.
        </div>
      )}
    </div>
  );
}
