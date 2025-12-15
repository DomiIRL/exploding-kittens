import type {Card, GameState, Player, Players} from '../models';
import type {Deck} from '../entities/deck';

export const createPlayerState = (): Player => ({
  hand: [],
  isAlive: true,
  client: {
    handCount: 0
  }
});

/**
 * Create a full view of a player (used for self-view and spectators)
 */
const createFullPlayerView = (player: Player): Player => ({
  ...player,
  client: {
    handCount: player.hand.length
  }
});

/**
 * Create a limited view of a player (used for opponent views)
 */
const createLimitedPlayerView = (player: Player): Player => ({
  hand: [],
  isAlive: player.isAlive,
  client: {
    handCount: player.hand.length
  }
});

/**
 * Check if the viewing player should see all cards (spectator or dead player)
 */
const shouldSeeAllCards = (
  G: GameState,
  players: Players,
  playerID?: string | null,
): boolean => {
  // Spectators see all cards
  if (!playerID) return true;

  // If openCards rule is enabled, everyone sees all cards
  if (G.gameRules.openCards) return true;

  const currentPlayer = players[playerID];
  const isCurrentPlayerDead = currentPlayer && !currentPlayer.isAlive;
  const spectatorsCanSeeAll = !G.gameRules.spectatorsCardsHidden;

  // Dead players with permission see all cards
  return isCurrentPlayerDead && spectatorsCanSeeAll;
};

export const filterPlayerView = (G: GameState, players: Players, playerID?: string | null): Players => {
  const canSeeAllCards = shouldSeeAllCards(G, players, playerID);

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
  });
}
