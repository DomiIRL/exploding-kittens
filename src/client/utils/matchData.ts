/**
 * Utility functions for working with matchData
 */

export interface MatchPlayer {
  id: number;
  name?: string;
  isConnected?: boolean;
}

/**
 * Get player name from matchData by player ID
 * Returns "Player {id + 1}" as fallback if matchData is not available or name is missing
 */
export function getPlayerName(playerID: string | null, matchData?: MatchPlayer[]): string {
  if (!playerID) return 'Unknown Player';

  const playerId = parseInt(playerID);

  if (!matchData || matchData.length === 0) {
    return `Player ${playerId + 1}`;
  }

  const player = matchData.find(p => p.id === playerId);
  return player?.name || `Player ${playerId + 1}`;
}

