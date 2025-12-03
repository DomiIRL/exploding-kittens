import type { Card, Player, Players } from '../models';
import type { Deck } from '../entities/deck';

export const createPlayerState = (): Player => ({
  hand: [],
  hand_count: 0,
  isAlive: true,
});

/**
 * Create a full view of a player (used for self-view and spectators)
 */
const createFullPlayerView = (player: Player): Player => ({ ...player });

/**
 * Create a limited view of a player (used for opponent views)
 */
const createLimitedPlayerView = (player: Player): Player => ({
  hand: [],
  hand_count: player.hand_count,
  isAlive: player.isAlive,
});

/**
 * Check if the viewing player should see all cards (spectator or dead player)
 */
const shouldSeeAllCards = (
    players: Players,
    playerID?: string | null,
    G?: any
): boolean => {
  // Spectators see all cards
  if (!playerID) return true;

  const currentPlayer = players[playerID];
  const isCurrentPlayerDead = currentPlayer && !currentPlayer.isAlive;
  const deadPlayersCanSeeAll = G?.deadPlayersCanSeeAllCards ?? true;

  // Dead players with permission see all cards
  return isCurrentPlayerDead && deadPlayersCanSeeAll;
};

export const filterPlayerView = (players: Players, playerID?: string | null, G?: any): Players => {
  const canSeeAllCards = shouldSeeAllCards(players, playerID, G);

  const view: Players = {};
  Object.entries(players).forEach(([id, pdata]) => {
    if (canSeeAllCards || id === playerID) {
      view[id] = createFullPlayerView(pdata);
    } else {
      view[id] = createLimitedPlayerView(pdata);
    }
  });

  return view;
};

export function dealHands(pile: Card[], players: Players, deck: Deck) {
  const handSize = deck.startingHandSize();

  Object.values(players).forEach((player, index) => {
    player.hand = pile.splice(0, handSize);
    const forcedCards = deck.startingHandForcedCards(index);
    player.hand.push(...forcedCards);
    player.hand_count = player.hand.length;
  });
}
