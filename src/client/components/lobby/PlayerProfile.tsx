import './LobbyStyles.css';

interface PlayerProfileProps {
  playerName: string;
  onEditName: () => void;
}

export function PlayerProfile({ playerName, onEditName }: PlayerProfileProps) {
  return (
    <div className="lobby-player-profile">
      <div className="lobby-player-info">
        <span className="lobby-player-label">Playing as</span>
        <span className="lobby-player-name">👤 {playerName}</span>
      </div>
      <button
        className="lobby-edit-name-btn"
        onClick={onEditName}
        title="Change your name"
      >
        ✏️ Edit
      </button>
    </div>
  );
}

