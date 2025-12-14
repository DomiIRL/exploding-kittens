import {useState, useEffect, useMemo} from 'react';
import {LobbyClient as BgioLobbyClient} from 'boardgame.io/client';
import './Lobby.css';

interface LobbyMatch {
  matchID: string;
  gameName: string;
  players: Array<{id: number; name?: string}>;
  setupData?: {
    matchName?: string;
    maxPlayers?: number;
    openCards?: boolean;
    spectatorsCanSeeCards?: boolean;
  };
}

interface LobbyClientProps {
  gameServer: string;
  gameName: string;
  onJoinMatch: (matchID: string, playerID: string, credentials: string) => void;
}

export default function LobbyClient({gameServer, gameName, onJoinMatch}: LobbyClientProps) {
  // Create LobbyClient instance
  const lobbyClient = useMemo(() => new BgioLobbyClient({server: gameServer}), [gameServer]);

  const [matches, setMatches] = useState<LobbyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [showNameModal, setShowNameModal] = useState(!playerName);
  const [tempPlayerName, setTempPlayerName] = useState(playerName);
  const [matchName, setMatchName] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);
  const [openCards, setOpenCards] = useState(false);
  const [spectatorsCanSeeCards, setSpectatorsCanSeeCards] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (playerName) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 3000);
      return () => clearInterval(interval);
    }
  }, [playerName, lobbyClient]);

  const fetchMatches = async () => {
    try {
      const data = await lobbyClient.listMatches(gameName, {isGameover: false});
      setMatches(data.matches || []);
      setError(null);
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async () => {
    if (!matchName.trim()) {
      alert('Please enter a match name');
      return;
    }

    setCreating(true);
    try {
      const {matchID} = await lobbyClient.createMatch(gameName, {
        numPlayers,
        setupData: {
          matchName: matchName.trim(),
          maxPlayers: numPlayers,
          openCards: openCards,
          spectatorsCanSeeCards: openCards ? false : spectatorsCanSeeCards
        }
      });

      // Join the match immediately
      await joinMatch(matchID, 0);

      setMatchName('');
    } catch (err) {
      setError('Failed to create match');
      console.error('Error creating match:', err);
    } finally {
      setCreating(false);
    }
  };

  const joinMatch = async (matchID: string, playerID: number) => {
    try {
      const {playerCredentials} = await lobbyClient.joinMatch(gameName, matchID, {
        playerID: playerID.toString(),
        playerName
      });

      onJoinMatch(matchID, playerID.toString(), playerCredentials);
    } catch (err) {
      setError('Failed to join match');
      console.error('Error joining match:', err);
    }
  };

  const savePlayerName = () => {
    if (!tempPlayerName.trim()) {
      alert('Please enter a name');
      return;
    }
    const trimmedName = tempPlayerName.trim();
    localStorage.setItem('playerName', trimmedName);
    setPlayerName(trimmedName);
    setShowNameModal(false);
  };

  const openNameModal = () => {
    setTempPlayerName(playerName);
    setShowNameModal(true);
  };

  const getAvailableSlot = (match: LobbyMatch): number | null => {
    const maxPlayers = match.setupData?.maxPlayers || match.players.length;
    for (let i = 0; i < maxPlayers; i++) {
      if (!match.players[i]?.name) {
        return i;
      }
    }
    return null;
  };

  const isMatchFull = (match: LobbyMatch): boolean => {
    return getAvailableSlot(match) === null;
  };

  const getJoinedPlayersCount = (match: LobbyMatch): number => {
    return match.players.filter(p => p.name).length;
  };

  if (showNameModal) {
    const isInitialSetup = !playerName;
    return (
      <div className="player-name-modal">
        <div className="player-name-content">
          <h2 className="modal-title">
            {isInitialSetup ? 'Welcome to Exploding Kittens! 🐱💣' : 'Change Your Name'}
          </h2>
          <div className="form-group">
            <label className="form-label">
              {isInitialSetup ? 'Enter Your Name' : 'New Name'}
            </label>
            <input
              type="text"
              className="form-input"
              value={tempPlayerName}
              onChange={(e) => setTempPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && savePlayerName()}
              placeholder="Your name..."
              autoFocus
            />
          </div>
          <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
            {!isInitialSetup && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowNameModal(false)}
                style={{flex: 1}}
              >
                Cancel
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={savePlayerName}
              style={{flex: 1}}
            >
              {isInitialSetup ? 'Continue' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">🐱💣 Exploding Kittens</h1>
        <p className="lobby-subtitle">Create or join a match to start playing!</p>
        <div className="player-profile">
          <div className="player-profile-info">
            <span className="player-profile-label">Playing as:</span>
            <span className="player-profile-name">👤 {playerName}</span>
          </div>
          <button
            className="btn-change-name"
            onClick={openNameModal}
            title="Change your name"
          >
            ✏️ Change Name
          </button>
        </div>
      </div>

      <div className="lobby-content">
        {/* Create Match Section */}
        <div className="lobby-section">
          <div className="section-header">
            <h2 className="section-title">Create Match</h2>
          </div>

          <div className="create-match-form">
            <div className="form-group">
              <label className="form-label">Match Name</label>
              <input
                type="text"
                className="form-input"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder="Enter match name..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Players</label>
              <select
                className="form-select"
                value={numPlayers}
                onChange={(e) => setNumPlayers(parseInt(e.target.value))}
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
                <option value={5}>5 Players</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Game Rules</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={openCards}
                    onChange={(e) => setOpenCards(e.target.checked)}
                  />
                  <span>Open Cards (all players can see each other's cards)</span>
                </label>
                <label className={`checkbox-label ${openCards ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={spectatorsCanSeeCards}
                    onChange={(e) => setSpectatorsCanSeeCards(e.target.checked)}
                    disabled={openCards}
                  />
                  <span>Spectators Can See Cards (eliminated players can see all cards)</span>
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={createMatch}
              disabled={creating || !matchName.trim()}
            >
              {creating ? 'Creating...' : '🎮 Create Match'}
            </button>
          </div>
        </div>

        {/* Available Matches Section */}
        <div className="lobby-section">
          <div className="section-header">
            <h2 className="section-title">Available Matches</h2>
            <button className="refresh-btn" onClick={fetchMatches} title="Refresh">
              🔄
            </button>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p className="loading-text">Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎲</div>
              <p className="empty-state-text">
                No matches available.<br />Create one to get started!
              </p>
            </div>
          ) : (
            <div className="match-list">
              {matches.map((match) => {
                const maxPlayers = match.setupData?.maxPlayers || match.players.length;
                const joinedCount = getJoinedPlayersCount(match);
                const availableSlot = getAvailableSlot(match);
                const isFull = isMatchFull(match);
                const matchDisplayName = match.setupData?.matchName || match.matchID;

                return (
                  <div key={match.matchID} className="match-card">
                    <div className="match-header">
                      <h3 className="match-name">{matchDisplayName}</h3>
                      <span className={`match-status ${joinedCount < maxPlayers ? 'status-waiting' : 'status-playing'}`}>
                        {joinedCount < maxPlayers ? 'Waiting' : 'Playing'}
                      </span>
                    </div>

                    <div className="match-info">
                      <div className="match-info-item">
                        <span>👥</span>
                        <span>{joinedCount} / {maxPlayers} players</span>
                      </div>
                      <div className="match-info-item">
                        <span>🆔</span>
                        <span>{match.matchID.slice(0, 8)}</span>
                      </div>
                    </div>

                    {(match.setupData?.openCards || match.setupData?.spectatorsCanSeeCards) && (
                      <div className="match-rules">
                        {match.setupData?.openCards && (
                          <span className="rule-badge">👁️ Open Cards</span>
                        )}
                        {match.setupData?.spectatorsCanSeeCards && (
                          <span className="rule-badge">👻 Spectators Can See</span>
                        )}
                      </div>
                    )}

                    <div className="match-players">
                      {Array.from({length: maxPlayers}).map((_, i) => (
                        <div
                          key={i}
                          className={`player-badge ${match.players[i]?.name ? 'joined' : ''}`}
                        >
                          {match.players[i]?.name || `Slot ${i + 1}`}
                        </div>
                      ))}
                    </div>

                    <div className="match-actions">
                      {!isFull && availableSlot !== null ? (
                        <button
                          className="btn btn-success btn-small"
                          onClick={() => joinMatch(match.matchID, availableSlot)}
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

