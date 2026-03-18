import type {GameState} from '../models';

interface SetupData {
  matchName?: string;
  maxPlayers?: number;
  openCards?: boolean;
  spectatorsSeeCards?: boolean;
  deckType?: string;
}

export const setupGame = (_context: any, setupData?: SetupData): GameState => {
  // Don't deal cards yet - will be done when lobby phase ends
  return {
    winner: null,
    drawPile: [],
    discardPile: [],
    pendingCardPlay: null,
    turnsRemaining: 1,
    gameRules: {
      spectatorsSeeCards: setupData?.spectatorsSeeCards ?? false,
      openCards: setupData?.openCards ?? false,
      nopeTimerMs: 3000,
    },
    deckType: setupData?.deckType ?? 'original',
    client: {
      drawPileLength: 0
    },
    lobbyReady: false,
  };
};
