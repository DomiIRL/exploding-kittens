import { PlayerProfile } from './PlayerProfile';
import '../common/Button.css';
import './LobbyStyles.css';

interface LobbyTopBarProps {
  playerName: string;
  onEditName: () => void;
  onCreateMatch: () => void;
}

export function LobbyTopBar({ playerName, onEditName, onCreateMatch }: LobbyTopBarProps) {
  return (
    <div className="lobby-top-bar">
      <PlayerProfile playerName={playerName} onEditName={onEditName} />
      <button
        className="btn btn-primary btn-large"
        onClick={onCreateMatch}
      >
        💥 Create New Match
      </button>
    </div>
  );
}

