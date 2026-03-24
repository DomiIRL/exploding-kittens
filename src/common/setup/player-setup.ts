import type {ICard, IPlayer, IPlayers} from '../models';
import type {DeckType} from '../entities/deck-type';
import {cardTypeRegistry} from "../registries/card-registry";
import {CardType} from "../entities/card-type";
import {TheGame} from "../entities/game";
import {NAME_EXPLODING_KITTEN} from "../constants/cards";

export const createPlayerState = (): IPlayer => ({
  hand: [],
  handSize: 0,
  isAlive: true
});

/**
 * Create a full view of a player (used for self-view and spectators)
 */
const createFullPlayerView = (player: IPlayer): IPlayer => player;

/**
 * Create a limited view of a player (used for opponent views)
 * Show exploding kittens but remove the other cards
 */
const createLimitedPlayerView = (player: IPlayer): IPlayer => ({
  ...player,
  hand: player.hand.filter(c => c.name === NAME_EXPLODING_KITTEN)
});

/**
 * Check if the viewing player should see all card-types (spectator or dead player)
 */
const shouldSeeAllCards = (game: TheGame): boolean => {
  // If openCards rule is enabled, everyone sees all card-types
  if (game.gameRules.openCards) return true;

  // Spectators (no playerID) see all card-types ONLY if rule allows
  const player = game.players.actingPlayerOptional;
  if (!player || !player.isAlive) {
    return game.gameRules.spectatorsSeeCards;
  }
  return false;
};

export const filterPlayerView = (game: TheGame): IPlayers => {
  const canSeeAllCards = shouldSeeAllCards(game);

  const view: IPlayers = {};
  game.players.allPlayers.forEach(value => {
    const id = value.id;
    const pdata = game.players.getPlayer(id)._state;
    if (canSeeAllCards || id === game.players.actingPlayerId) {
      view[id] = createFullPlayerView(pdata);
    } else {
      view[id] = createLimitedPlayerView(pdata);
    }
  })

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
    player.handSize = player.hand.length;
  });
}
