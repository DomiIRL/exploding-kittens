import './Board.css';
import {BoardProps} from 'boardgame.io/react';
import {GameState} from '../../../common';
import {useCardAnimations} from '../../hooks/useCardAnimations';
import {useExplosionEvents} from '../../hooks/useExplosionEvents';
import {useGameState} from '../../hooks/useGameState';
import {BoardPlugins} from '../../models/client.model.ts';
import Table from './table/Table';
import PlayerList from './player-list/PlayerList';
import OverlayManager from './overlay-manager/OverlayManager';
import DebugPanel from './debug-panel/DebugPanel';

interface BoardPropsWithPlugins extends BoardProps<GameState> {
  plugins: BoardPlugins;
}

/**
 * Main game board component
 * Orchestrates the game view by composing specialized components and hooks
 */
export default function ExplodingKittensBoard({
  ctx,
  G,
  moves,
  plugins,
  playerID
}: BoardPropsWithPlugins) {
  const allPlayers = plugins.player.data.players;

  // Derive game state properties
  const gameState = useGameState(ctx, G, allPlayers, playerID);

  // Handle card animations
  const {AnimationLayer, triggerCardMovement} = useCardAnimations(G);

  // Handle explosion/defuse events
  const explosion = useExplosionEvents(G, allPlayers, playerID);

  /**
   * Handle player selection for stealing a card
   */
  const handlePlayerSelect = (targetPlayerId: string) => {
    if (gameState.isSelectingPlayer && moves.stealCard) {
      moves.stealCard(targetPlayerId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-200">
      <div className={`board-container ${gameState.isSelfSpectator ? 'hand-interactable' : ''} ${gameState.isSelfDead ? 'dimmed' : ''}`}>
        <Table G={G} moves={moves} />

        <PlayerList
          alivePlayersSorted={gameState.alivePlayersSorted}
          allPlayers={allPlayers}
          selfPlayerId={gameState.selfPlayerId}
          isSelfDead={gameState.isSelfDead}
          isSelfSpectator={gameState.isSelfSpectator}
          currentPlayer={gameState.currentPlayer}
          isSelectingPlayer={gameState.isSelectingPlayer}
          playerID={playerID}
          moves={moves}
          triggerCardMovement={triggerCardMovement}
          onPlayerSelect={handlePlayerSelect}
        />
      </div>

      <AnimationLayer />

      <OverlayManager
        explosionEvent={explosion.event}
        explosionPlayerName={explosion.playerName}
        explosionIsSelf={explosion.isSelf}
        onExplosionComplete={explosion.clearEvent}
        isSelectingPlayer={gameState.isSelectingPlayer}
        isSelfDead={gameState.isSelfDead}
        isGameOver={gameState.isGameOver}
        winnerID={G.winner}
        playerID={playerID}
      />

      <DebugPanel data={{ctx, G, moves, plugins, playerID}} />
    </div>
  );
}
