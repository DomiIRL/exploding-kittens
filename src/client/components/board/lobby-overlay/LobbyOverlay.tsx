import './LobbyOverlay.css';
import {MatchPlayer} from '../../../utils/matchData';

interface LobbyOverlayProps {
  matchData?: MatchPlayer[];
  numPlayers: number;
  onStartGame?: () => void;
}

export default function LobbyOverlay({matchData, numPlayers, onStartGame}: LobbyOverlayProps) {
  const filledSlots = matchData?.filter(p => p.isConnected).length || 0;
  const allPlayersFilled = filledSlots === numPlayers;

  return (
    <div className="game-lobby-overlay">
      <div className="game-lobby-content">
        <h2 className="game-lobby-title">🎮 Waiting for Players</h2>
        <p className="game-lobby-subtitle">
          The game will start when all players have joined
        </p>
        <div className="game-lobby-progress">
          <div className="game-lobby-progress-bar">
            <div
              className="game-lobby-progress-fill"
              style={{width: `${(filledSlots / numPlayers) * 100}%`}}
            />
          </div>
          <div className="game-lobby-progress-text">
            {filledSlots} / {numPlayers} players joined
          </div>
        </div>

        <div className="game-lobby-players">
          {Array.from({length: numPlayers}).map((_, i) => {
            const player = matchData?.[i];
            const hasJoined = player?.isConnected;

            return (
              <div
                key={i}
                className={`game-lobby-player-slot ${hasJoined ? 'joined' : 'empty'}`}
              >
                <div className="game-lobby-player-icon">
                  {hasJoined ? '👤' : '⏳'}
                </div>
                <div className="game-lobby-player-name">
                  {hasJoined ? player?.name || "Unknown" : `Waiting for Player ${i + 1}...`}
                </div>
                {hasJoined && (
                  <div className="game-lobby-player-status">✓ Ready</div>
                )}
              </div>
            );
          })}
        </div>

        {allPlayersFilled && onStartGame && (
          <button className="game-lobby-start-btn" onClick={onStartGame}>
            🚀 Start Game
          </button>
        )}
      </div>
    </div>
  );
}

