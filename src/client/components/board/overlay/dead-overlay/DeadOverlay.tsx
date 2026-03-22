import './DeadOverlay.css';
import {useGame} from "../../../../context/GameContext.tsx";

export default function DeadOverlay() {
  const game = useGame();

  if (game.isSelfAlive) {
    return null;
  }

  if (!game.isPlayingPhase()) {
    return null;
  }

  return (
    <div className="dead-overlay">
      <div className="dead-overlay-content">
        <h1 className="dead-overlay-title">
          <span className="dead-overlay-icon">💥</span>
          You exploded
        </h1>
      </div>
    </div>
  );
}

