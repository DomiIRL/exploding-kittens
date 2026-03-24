/**
 * Utility functions for working with matchData
 */
import {useMatchDetails} from "../context/MatchDetailsContext.tsx";
import {PlayerID} from "boardgame.io";

const EMPTY_NAME = "Empty Seat";

export interface MatchPlayer {
  id: PlayerID;
  name?: string;
  isConnected?: boolean;
}

/**
 * Get player name from matchData by player ID
 * Returns "Player X" if matchData is not available
 * Returns "Empty Seat" if matchData is available but player name is missing
 */
export function getPlayerName(player: MatchPlayer | string | null | undefined): string {
  if (!player) return EMPTY_NAME;

  if (typeof player === 'string') {
    const { matchDetails } = useMatchDetails();
    const players = matchDetails?.players;
    const playerObj = players?.find(p => p.id === player);
    return playerObj?.name || EMPTY_NAME;
  }

  return player?.name || EMPTY_NAME;
}
