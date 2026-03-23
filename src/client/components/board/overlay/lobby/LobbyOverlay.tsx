import './LobbyOverlay.css';
import {useMatchDetails} from "../../../../context/MatchDetailsContext.tsx";
import {useGame} from "../../../../context/GameContext.tsx";


export default function LobbyOverlay() {
  const game = useGame();

  if (!game.isLobbyPhase()) {
    return null;
  }

  const { matchDetails } = useMatchDetails();
  const { players, numPlayers } = matchDetails || {players: [], numPlayers: 1};

  const filledSlots = players?.filter(p => p.isConnected).length || 0;
  const allPlayersFilled = filledSlots === numPlayers;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handStartButton = () => {
    if (game.moves.startGame) {
      game.moves.startGame();
    }
  };

  return (
    <div className="game-lobby-overlay">
      <div className="game-lobby-content">
        <h2 className="game-lobby-title">Waiting for Players</h2>
        <p className="game-lobby-subtitle">
          The game will start when all players have joined
        </p>

        <div className="game-lobby-invite">
             <span className="invite-label">Invite Link:</span>
             <div className="invite-link-container">
               <input type="text" readOnly value={window.location.href} className="invite-link-input" />
               <button className="invite-copy-btn" onClick={copyLink}>Copy</button>
             </div>
        </div>

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
            const player = players?.[i];
            const hasJoined = player?.isConnected;
            const isSelf = game.isSelf(player);

            return (
              <div
                key={i}
                className={`game-lobby-player-slot ${hasJoined ? 'joined' : 'empty'}`}
              >
                <div className="game-lobby-player-icon">
                  {hasJoined ? '👤' : '⏳'}
                </div>
                <div className="game-lobby-player-name">
                  {hasJoined ? (player?.name + (isSelf ? " (You)" : "")) || "Unknown" : `Waiting for Player`}
                </div>
                {hasJoined && (
                  <div className="game-lobby-player-status">✓ Ready</div>
                )}
              </div>
            );
          })}
        </div>

        {allPlayersFilled && (
          <button className="game-lobby-start-btn" onClick={handStartButton}>
            🚀 Start Game
          </button>
        )}
      </div>
    </div>
  );
}
