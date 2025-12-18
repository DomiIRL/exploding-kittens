import { useState, useEffect, useMemo } from 'react';
import { LobbyClient as BgioLobbyClient } from 'boardgame.io/client';
import { LobbyHeader } from './LobbyHeader';
import { LobbyTopBar } from './LobbyTopBar';
import { MatchList, LobbyMatch } from './MatchList';
import { CreateMatchModal } from './CreateMatchModal';
import { NameModal } from './NameModal';
import { LobbyFooter } from './LobbyFooter';
import { InitialSetup } from './InitialSetup';
import './LobbyStyles.css';

interface LobbyClientProps {
  gameServer: string;
  gameName: string;
  onJoinMatch: (matchID: string, playerID: string, credentials: string) => void;
}

export default function LobbyClient({ gameServer, gameName, onJoinMatch }: LobbyClientProps) {
  const lobbyClient = useMemo(() => new BgioLobbyClient({ server: gameServer }), [gameServer]);

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
      const data = await lobbyClient.listMatches(gameName, { isGameover: false });
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
      const { matchID } = await lobbyClient.createMatch(gameName, {
        numPlayers,
        setupData: {
          matchName: matchName.trim(),
          maxPlayers: numPlayers,
          deckType: deckType,
          openCards: openCards,
          spectatorsCardsHidden: openCards ? false : spectatorsCardsHidden
        }
      });

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
    }).then(({ playerID, playerCredentials }) => {
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
      <InitialSetup
        name={tempPlayerName}
        onNameChange={setTempPlayerName}
        onSave={savePlayerName}
      />
    );
  }

  return (
    <div className="lobby-container">
      <LobbyHeader />

      <div className="lobby-content">
        <LobbyTopBar
          playerName={playerName}
          onEditName={openNameModal}
          onCreateMatch={() => setShowCreateModal(true)}
        />

        <MatchList
          matches={matches}
          loading={loading}
          error={error}
          onRefresh={fetchMatches}
          onJoinMatch={joinMatch}
        />
      </div>

      {showCreateModal && (
        <CreateMatchModal
          matchName={matchName}
          numPlayers={numPlayers}
          deckType={deckType}
          openCards={openCards}
          spectatorsCardsHidden={spectatorsCardsHidden}
          creating={creating}
          onMatchNameChange={setMatchName}
          onNumPlayersChange={setNumPlayers}
          onDeckTypeChange={setDeckType}
          onOpenCardsChange={setOpenCards}
          onSpectatorsCardsHiddenChange={setSpectatorsCardsHidden}
          onCreateMatch={createMatch}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showNameModal && !isInitialSetup && (
        <NameModal
          name={tempPlayerName}
          onNameChange={setTempPlayerName}
          onSave={savePlayerName}
          onClose={() => setShowNameModal(false)}
        />
      )}

      <LobbyFooter />
    </div>
  );
}
