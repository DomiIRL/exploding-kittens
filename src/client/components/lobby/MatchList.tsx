import { MatchCard } from './MatchCard';
import { MatchPlayer } from '../../utils/matchData';
import './LobbyStyles.css';

interface MatchSetupData {
  matchName: string;
  maxPlayers: number;
  openCards: boolean;
  spectatorsCardsHidden?: boolean;
  deckType?: string;
}

interface LobbyMatch {
  matchID: string;
  gameName: string;
  players: Array<MatchPlayer>;
  setupData: MatchSetupData;
}

interface MatchListProps {
  matches: LobbyMatch[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onJoinMatch: (matchID: string) => void;
}

export function MatchList({ matches, loading, error, onRefresh, onJoinMatch }: MatchListProps) {
  return (
    <div className="lobby-section lobby-section-matches">
      <div className="lobby-section-header">
        <h2 className="lobby-section-title">Available Matches</h2>
        <button className="lobby-refresh-btn" onClick={onRefresh} title="Refresh">
          🔄
        </button>
      </div>

      {error && (
        <div className="lobby-error">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="lobby-loading">
          <div className="lobby-spinner" />
          <p className="lobby-loading-text">Loading matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="lobby-empty-state">
          <div className="lobby-empty-icon">🎲</div>
          <p className="lobby-empty-text">
            No matches available.<br />Create one to get started!
          </p>
        </div>
      ) : (
        <div className="lobby-match-list">
          {matches.map((match) => (
            <MatchCard
              key={match.matchID}
              matchID={match.matchID}
              matchName={match.setupData?.matchName || match.matchID}
              players={match.players}
              setupData={match.setupData}
              onJoin={onJoinMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { LobbyMatch, MatchSetupData };

