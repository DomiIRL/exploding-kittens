/**
 * Utility functions for working with matchData
 */

export interface MatchPlayer {
  id: string;
  name?: string;
  isConnected?: boolean;
}

/**
 * Get player name from matchData by player ID
 * Returns "Player X" if matchData is not available
 * Returns "Empty Seat" if matchData is available but player name is missing
 */
export function getPlayerName(playerId: string | null, matchData?: MatchPlayer[]): string {
  if (!playerId) return 'Unknown Player';

  if (!matchData || matchData.length === 0) {
    return `Player`;
  }

  const player = matchData.find(p => p.id === playerId);
  
  // If player object exists but has no name, it's an empty seat
  if (player && !player.name) {
    return "Empty Seat";
  }
  
  // If player object doesn't exist in matchData (but matchData exists), it's likely an empty seat too
  if (!player) {
    // Check if the ID is within the bounds of matchData (if matchData represents all seats)
    // Assuming matchData is the full list including empty seats
    return "Empty Seat";
  }

  return player.name!;
}
