import { SPECIAL_CARDS, GAME_CONSTANTS } from '../data/Deck';

export interface PlayerState {
  hand: string[];
  hand_count: number;
  isAlive: boolean;
}

export interface PlayerStates {
  [playerID: string]: PlayerState;
}

/**
 * Initial player state setup
 */
export const createPlayerState = (): PlayerState => ({
  hand: [],
  hand_count: 0,
  isAlive: true,
});

/**
 * Player view filter - hides other players' hands
 */
export const filterPlayerView = (players: PlayerStates, playerID?: string | null): PlayerStates => {
  if (!playerID) {
    return players;
  }

  const view: PlayerStates = {};

  Object.entries(players).forEach(([id, pdata]) => {
    if (id === playerID) {
      // Current player sees their full state
      view[id] = { ...pdata };
    } else {
      // Other players only see hand count and alive status
      view[id] = {
        hand: [],
        hand_count: pdata.hand_count,
        isAlive: pdata.isAlive,
      };
    }
  });

  return view;
};

/**
 * Distributes initial cards to all players
 */
export const distributeInitialHands = (
  deck: string[],
  playOrder: string[],
  playerState: PlayerStates
): string[] => {
  const modifiedDeck = [...deck];

  // Give each player their starting hand
  playOrder.forEach((playerID) => {
    const hand = modifiedDeck.splice(0, GAME_CONSTANTS.STARTING_HAND_SIZE);
    playerState[playerID] = {
      hand,
      hand_count: hand.length,
      isAlive: true,
    };
  });

  // Give each player one defuse card
  playOrder.forEach((playerID) => {
    playerState[playerID].hand.push(SPECIAL_CARDS.DEFUSE);
    playerState[playerID].hand_count += 1;
  });

  return modifiedDeck;
};

