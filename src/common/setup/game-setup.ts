import type {GameState} from '../models';

interface SetupData {
  matchName?: string;
  maxPlayers?: number;
  openCards?: boolean;
  spectatorsCanSeeCards?: boolean;
}

export const setupGame = (_context: any, setupData?: SetupData): GameState => {
  // Don't deal cards yet - will be done when lobby phase ends
  return {
    winner: null,
    drawPile: [],
    discardPile: [],
    turnsRemaining: 1,
    gameRules: {
      spectatorsCanSeeCards: setupData?.spectatorsCanSeeCards ?? false,
      openCards: setupData?.openCards ?? false,
    },
    client: {
      drawPileLength: 0
    },
    lobbyReady: false,
  };
};


