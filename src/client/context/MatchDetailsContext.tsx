import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { MatchPlayer } from '../utils/matchData';
import {GAME_NAME, SERVER_URL} from "../config.ts";
export interface MatchDetails {
  matchID: string;
  players: MatchPlayer[];
  numPlayers: number;
  matchName: string;
  gameOver?: any;
}

interface MatchDetailsContextType {
  matchDetails: MatchDetails | null;
  loading: boolean;
  error: string | null;
  refreshMatchDetails: () => Promise<void>;
  setPollingInterval: (interval: number) => void;
}

const MatchDetailsContext = createContext<MatchDetailsContextType | undefined>(undefined);

interface MatchDetailsProviderProps {
  matchID: string;
  children: ReactNode;
}

export function MatchDetailsProvider({ matchID, children }: MatchDetailsProviderProps) {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number>(3000);

  const fetchMatchDetails = async () => {
    if (!matchID) {
      setLoading(false);
      return;
    }

    try {
      const lobbyClient = new LobbyClient({ server: SERVER_URL });
      const match = await lobbyClient.getMatch(GAME_NAME, matchID);

      const matchPlayers: MatchPlayer[] = match.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        isConnected: p.isConnected,
      }));
      
      setMatchDetails({
        matchID: match.matchID,
        matchName: match.setupData?.matchName || 'Match',
        numPlayers: match.setupData?.maxPlayers || match.players.length,
        players: matchPlayers,
        gameOver: match.gameover,
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching match details:', err);
      // Don't set error immediately on polling failure to avoid flickering UI
      // specially if network is flaky or server restarts
      if (!matchDetails) {
        setError(err.message || 'Failed to load match details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails(); // Initial fetch
    
    // Poll based on interval
    const interval = setInterval(fetchMatchDetails, pollingInterval);
    
    return () => clearInterval(interval);
  }, [matchID, pollingInterval]);

  useEffect(() => {
    const timeout = setTimeout(fetchMatchDetails, 100);
    return () => clearTimeout(timeout);
  }, [matchID, matchDetails?.matchName]);

  return (
    <MatchDetailsContext.Provider value={{ 
      matchDetails, 
      loading, 
      error, 
      refreshMatchDetails: fetchMatchDetails,
      setPollingInterval
    }}>
      {children}
    </MatchDetailsContext.Provider>
  );
}

export function useMatchDetails() {
  const context = useContext(MatchDetailsContext);
  if (context === undefined) {
    throw new Error('useMatchDetails must be used within a MatchDetailsProvider');
  }
  return context;
}
