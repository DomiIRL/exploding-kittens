import type {Card} from "../data/Card";
import type {Deck} from "../data/Deck";
import {Players} from "../data/Players";
import {Player} from "../data/Player";

export const createPlayerState = (): Player => ({
  hand: [],
  hand_count: 0,
  isAlive: true,
});

export const filterPlayerView = (
    players: Players,
    playerID?: string | null
): Players => {
  if (!playerID) return players;

  const view: Players = {};
  Object.entries(players).forEach(([id, pdata]) => {
    view[id] =
        id === playerID
            ? { ...pdata } // full view for self
            : { hand: [], hand_count: pdata.hand_count, isAlive: pdata.isAlive }; // limited view
  });
  return view;
};

export function dealHands(
    pile: Card[],
    players: Players,
    deck: Deck
) {
  const handSize = deck.startingHandSize();

  const playerList = Object.values(players);
  for (let player_index = 0; player_index < playerList.length; player_index++) {
    const player = playerList[player_index];
    player.hand = pile.splice(0, handSize);
    const forced = deck.startingHandForcedCards(player_index);
    player.hand.push(...forced);
    player.hand_count = player.hand.length;
  }
}
