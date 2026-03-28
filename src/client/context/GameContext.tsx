import { createContext, useContext, ReactNode } from 'react';
import { TheGameClient } from '../entities/game-client';

const GameContext = createContext<TheGameClient | null>(null);

export function GameProvider({ game, children }: { game: TheGameClient; children: ReactNode }) {
  return (
    <GameContext.Provider value={game}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): TheGameClient {
  const game = useContext(GameContext);
  if (!game) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return game;
}
