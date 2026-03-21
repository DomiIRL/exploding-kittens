import type {ICard, IGameState, IPlayer, IPlayers} from '../models';
import type {DeckType} from '../entities/deck-type';
import {cardTypeRegistry} from "../constants/card-types";
import {CardType} from "../entities/card-type";

export const createPlayerState = (): IPlayer => ({
  hand: [],
  isAlive: true,
  client: {
    handCount: 0
  }
});

/**
 * Create a full view of a player (used for self-view and spectators)
 */
const createFullPlayerView = (player: IPlayer): IPlayer => ({
  ...player,
  client: {
    handCount: player.hand.length
  }
});

/**
 * Create a limited view of a player (used for opponent views)
 */
const createLimitedPlayerView = (player: IPlayer): IPlayer => ({
  hand: [],
  isAlive: player.isAlive,
  client: {
    handCount: player.hand.length
  }
});

/**
 * Check if the viewing player should see all card-types (spectator or dead player)
 */
const shouldSeeAllCards = (
  G: IGameState,
  players: IPlayers,
  playerID?: string | null,
): boolean => {
  // If openCards rule is enabled, everyone sees all card-types
  if (G.gameRules.openCards) return true;

  // Spectators (no playerID) see all card-types ONLY if rule allows
  if (!playerID) return G.gameRules.spectatorsSeeCards;

  const currentPlayer = players[playerID];
  const isCurrentPlayerDead = currentPlayer && !currentPlayer.isAlive;
  const spectatorsCanSeeAll = G.gameRules.spectatorsSeeCards;

  // Dead players with permission see all card-types
  return isCurrentPlayerDead && spectatorsCanSeeAll;
};

export const filterPlayerView = (G: IGameState, players: IPlayers, playerID?: string | null): IPlayers => {
  const canSeeAllCards = shouldSeeAllCards(G, players, playerID);

  const view: IPlayers = {};
  Object.entries(players).forEach(([id, pdata]) => {
    if (canSeeAllCards || id === playerID) {
      view[id] = createFullPlayerView(pdata);
    } else {
      view[id] = createLimitedPlayerView(pdata);
    }
  });

  return view;
};

export function dealHands(pile: ICard[], players: IPlayers, deck: DeckType) {
  const handSize = deck.startingHandSize();

  Object.values(players).forEach((player, index) => {
    player.hand = pile.splice(0, handSize);
    const forcedCards = deck.startingHandForcedCards(index);

    // Add any card-types that are in testing mode (e.g. for development or QA purposes)
    cardTypeRegistry.getAll().forEach((card: CardType) => {
      if (card.inTesting()) {
        for (let i = 0; i < 3; i++) {
          forcedCards.push(card.createCard(0));
        }
      }
    });

    player.hand.push(...forcedCards);
  });
}
