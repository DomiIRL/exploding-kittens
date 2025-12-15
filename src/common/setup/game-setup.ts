import type {GameState} from '../models';

interface SetupData {
  matchName?: string;
  maxPlayers?: number;
  openCards?: boolean;
  spectatorsCardsHidden?: boolean;
  deckType?: string;
}

export const setupGame = (_context: any, setupData?: SetupData): GameState => {
  // Don't deal cards yet - will be done when lobby phase ends
  return {
    winner: null,
    drawPile: [],
    discardPile: [],
    turnsRemaining: 1,
    gameRules: {
      spectatorsCardsHidden: setupData?.spectatorsCardsHidden ?? false,
      openCards: setupData?.openCards ?? false,
    },
    deckType: setupData?.deckType ?? 'original',
    client: {
      drawPileLength: 0
    },
    lobbyReady: false,
  };
};


