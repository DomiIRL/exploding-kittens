import type {IGameState} from '../models';

interface SetupData {
  matchName?: string;
  maxPlayers?: number;
  openCards?: boolean;
  spectatorsSeeCards?: boolean;
  deckType?: string;
}

export const setupGame = (_context: any, setupData?: SetupData): IGameState => {
  // Don't deal card-types yet - will be done when lobby phase ends
  return {
    winner: null,
    piles: {
      drawPile: {
        cards: [],
        size: 0,
      },
      discardPile: {
        cards: [],
        size: 0,
      },
      pendingCardPlay: null,
    },
    turnsRemaining: 1,
    gameRules: {
      spectatorsSeeCards: setupData?.spectatorsSeeCards ?? false,
      openCards: setupData?.openCards ?? false,
      pendingTimerMs: 3000,
    },
    deckType: setupData?.deckType ?? 'original',
    animationsQueue: {},
  };
};
