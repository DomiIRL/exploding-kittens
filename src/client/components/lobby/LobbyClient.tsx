import {useState, useEffect, useMemo} from 'react';
import {LobbyClient as BgioLobbyClient} from 'boardgame.io/client';
import {Modal} from '../common/Modal';
import {MatchCard} from './MatchCard';
import {MatchPlayer} from "../../utils/matchData";
import '../common/Button.css';
import '../common/Form.css';
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
  const [matchName, setMatchName] = useState(`${playerName}'s Match`);
  const [numPlayers, setNumPlayers] = useState(2);
  const [deckType, setDeckType] = useState('original');
  const [openCards, setOpenCards] = useState(false);
  const [spectatorsCardsHidden, setSpectatorsCardsHidden] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      // @ts-ignore
      setMatches(data.matches);
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
          deckType: deckType,
          openCards: openCards,
          spectatorsCardsHidden: openCards ? false : spectatorsCardsHidden
        }
      });

      // Join the match immediately
      await joinMatch(matchID);

      setMatchName('');
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to create match');
      console.error('Error creating match:', err);
    } finally {
      setCreating(false);
    }
  };

  const joinMatch = async (matchID: string) => {
    console.log(`Joining match ${matchID}`);
    await lobbyClient.joinMatch(gameName, matchID, {
      playerName
    }).then(({playerID, playerCredentials}) => {
      onJoinMatch(matchID, playerID, playerCredentials);
    }).catch((err) => {
      setError('Failed to join match');
      console.error('Error joining match:', err);
      throw err;
    });
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
    setMatchName(`${trimmedName}'s Match`);
  };

  const openNameModal = () => {
    setTempPlayerName(playerName);
    setShowNameModal(true);
  };

  const isInitialSetup = !playerName;

  if (showNameModal && isInitialSetup) {
    return (
      <div className="lobby-initial-setup">
        <div className="lobby-initial-setup-content">
          <h2 className="modal-title">Welcome to Exploding Kittens!</h2>
          <div className="form-group">
            <label className="form-label">Enter Your Name</label>
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
          <button
            className="btn btn-primary"
            onClick={savePlayerName}
            style={{width: '100%'}}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">🐱💣 Exploding Kittens</h1>
        <p className="lobby-subtitle">Create or join a match to start playing!</p>
      </div>

      <div className="lobby-content">
        <div className="lobby-top-bar">
          <div className="lobby-player-profile">
            <div className="lobby-player-info">
              <span className="lobby-player-label">Playing as</span>
              <span className="lobby-player-name">👤 {playerName}</span>
            </div>
            <button
              className="lobby-edit-name-btn"
              onClick={openNameModal}
              title="Change your name"
            >
              ✏️ Edit
            </button>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowCreateModal(true)}
          >
            💥 Create New Match
          </button>
        </div>

        {/* Available Matches Section */}
        <div className="lobby-section lobby-section-matches">
          <div className="lobby-section-header">
            <h2 className="lobby-section-title">Available Matches</h2>
            <button className="lobby-refresh-btn" onClick={fetchMatches} title="Refresh">
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
                  onJoin={joinMatch}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Match Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)} title="💥 Create New Match 💥">
          <div className="form-group">
            <label className="form-label">Match Name</label>
            <input
              type="text"
              className="form-input"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="Enter match name..."
              autoFocus
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
            <label className="form-label">Deck</label>
            <select
              className="form-select"
              value={deckType}
              onChange={(e) => setDeckType(e.target.value)}
            >
              <option value="original">🃏 Original Version</option>
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
                  checked={spectatorsCardsHidden}
                  onChange={(e) => setSpectatorsCardsHidden(e.target.checked)}
                  disabled={openCards}
                />
                <span>Hide Cards from Spectators (eliminated players cannot see cards)</span>
              </label>
            </div>
          </div>

          <div style={{display: 'flex', gap: '0.75rem'}}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
              style={{flex: 1}}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={createMatch}
              disabled={creating || !matchName.trim()}
              style={{flex: 1}}
            >
              {creating ? 'Creating...' : '🎮 Create & Join'}
            </button>
          </div>
        </Modal>
      )}

      {showNameModal && !isInitialSetup && (
        <Modal onClose={() => setShowNameModal(false)} title="✏️ Change Your Name">
          <div className="form-group">
            <label className="form-label">New Name</label>
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

          <div style={{display: 'flex', gap: '0.75rem'}}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowNameModal(false)}
              style={{flex: 1}}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={savePlayerName}
              style={{flex: 1}}
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
