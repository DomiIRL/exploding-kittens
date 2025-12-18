import './MatchCard.css';
import {MatchPlayer} from '../../utils/matchData';

interface MatchSetupData {
  matchName: string;
  maxPlayers: number;
  openCards: boolean;
  spectatorsCardsHidden?: boolean;
  deckType?: string;
}

interface MatchCardProps {
  matchID: string;
  matchName: string;
  players: Array<MatchPlayer>;
  setupData: MatchSetupData;
  onJoin: (matchID: string) => void;
}

export function MatchCard({matchID, matchName, players, setupData, onJoin}: MatchCardProps) {
  const maxPlayers = setupData.maxPlayers;
  const joinedCount = players.filter(p => p?.isConnected).length;
  const isFull = players.every(p => p?.isConnected);

  return (
    <div className="match-card">
      <div className="match-card-header">
          <span className={`match-status ${joinedCount < maxPlayers ? 'match-status-waiting' : 'match-status-playing'}`}>
            {joinedCount < maxPlayers ? 'Waiting' : 'Playing'}
          </span>
          <h3 className="match-card-name">{matchName}</h3>
          <div className="match-info-item">
            <span>👥</span>
            <span>{joinedCount} / {maxPlayers}</span>
          </div>
      </div>

      <div className="match-card-content">
        <div className="match-card-left">
          <div className="match-card-players">
            {Array.from({length: maxPlayers}).map((_, i) => (
              <div
                key={i}
                className={`player-badge ${players[i]?.isConnected ? 'player-badge-joined' : ''}`}
              >
                {players[i]?.isConnected ? players[i]?.name || "Unknown" : `Empty Slot`}
              </div>
            ))}
          </div>

          <div className="match-card-rules">
            {setupData?.deckType && (
              <span className="rule-badge">🃏 {setupData.deckType === 'original' ? 'Original' : setupData.deckType}</span>
            )}
            {setupData?.openCards && (
              <span className="rule-badge">👁️ Open</span>
            )}
            {setupData?.spectatorsCardsHidden && (
              <span className="rule-badge">🚫 Cards Hidden</span>
            )}
          </div>
        </div>

        <div className="match-card-actions">
          {!isFull ? (
            <button
              className="btn btn-success btn-small"
              onClick={() => onJoin(matchID)}
            >
              Join Match
            </button>
          ) : (
            <button className="btn btn-secondary btn-small" disabled>
              Match Full
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

