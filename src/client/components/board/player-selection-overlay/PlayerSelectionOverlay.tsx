import './PlayerSelectionOverlay.css';

interface PlayerSelectionOverlayProps {
  message?: string;
}

export default function PlayerSelectionOverlay({ message = "Select a player to steal a card from" }: PlayerSelectionOverlayProps) {
  return (
    <div className="player-selection-overlay">
      <div className="selection-message">
        {message}
      </div>
    </div>
  );
}

