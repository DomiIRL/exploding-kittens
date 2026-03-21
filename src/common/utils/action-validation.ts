import {IGameState} from '../models/game-state.model';
import {ICard} from '../models/card.model';

/**
 * Validates if a player can play a Nope card against the current game state.
 * This is pure game logic validation.
 */
export function validateNope(G: IGameState, playerID: string | null | undefined): boolean {
  if (!playerID) return false;
  
  if (!G.pendingCardPlay) return false;

  const pending = G.pendingCardPlay;
  
  // Player cannot nope their own card play if it hasn't been noped yet
  // If it HAS been noped, they can re-nope (un-nope) it, unless they were the last person to nope it
  if (!pending.isNoped && pending.playedBy === playerID) {
    return false;
  }
  
  // Player cannot nope their own nope card (cannot double-nope themselves immediately)
  if (pending.lastNopeBy === playerID) {
    return false;
  }
  
  // Check expiration
  // Note: Date.now() on client might differ from server, but usually this is acceptable for UI state
  if (Date.now() > pending.expiresAtMs) {
    return false;
  }
  
  return true;
}

export function canPlayerNope(
  G: IGameState,
  playerID: string | null | undefined, 
  playerHand: ICard[]
): boolean {
  const nopeCardIndex = playerHand.findIndex(c => c.name === 'nope');
  if (nopeCardIndex === -1) return false;

  return validateNope(G, playerID);
}
