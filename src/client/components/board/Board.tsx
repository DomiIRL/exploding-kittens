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
   * Handle player selection for stealing/requesting a card
   */
  const handlePlayerSelect = (targetPlayerId: string) => {
    if (!gameState.isSelectingPlayer) return;

    // Check which stage we're in and call the appropriate move
    const stage = ctx.activePlayers?.[playerID || ''];
    if (stage === 'choosePlayerToStealFrom' && moves.stealCard) {
      moves.stealCard(targetPlayerId);
    } else if (stage === 'choosePlayerToRequestFrom' && moves.requestCard) {
      moves.requestCard(targetPlayerId);
    }
  };

  /**
   * Handle card selection when giving a card (favor card)
   */
  const handleCardGive = (cardIndex: number) => {
    if (gameState.isChoosingCardToGive && moves.giveCard) {
      moves.giveCard(cardIndex);
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
          isChoosingCardToGive={gameState.isChoosingCardToGive}
          playerID={playerID}
          moves={moves}
          triggerCardMovement={triggerCardMovement}
          onPlayerSelect={handlePlayerSelect}
          onCardGive={handleCardGive}
        />
      </div>

      <AnimationLayer />

      <OverlayManager
        explosionEvent={explosion.event}
        explosionPlayerName={explosion.playerName}
        explosionIsSelf={explosion.isSelf}
        onExplosionComplete={explosion.clearEvent}
        isSelectingPlayer={gameState.isSelectingPlayer}
        isChoosingCardToGive={gameState.isChoosingCardToGive}
        isSelfDead={gameState.isSelfDead}
        isGameOver={gameState.isGameOver}
        winnerID={G.winner}
        playerID={playerID}
        ctx={ctx}
      />

      <DebugPanel data={{ctx, G, moves, plugins, playerID}} />
    </div>
  );
}
