import WinnerOverlay from '../winner-overlay/WinnerOverlay';
import DeadOverlay from '../dead-overlay/DeadOverlay';
import PlayerSelectionOverlay from '../player-selection-overlay/PlayerSelectionOverlay';
import ExplosionOverlay from '../explosion-overlay/ExplosionOverlay';
import SeeTheFutureOverlay from '../see-future-overlay/SeeTheFutureOverlay';
import TurnsOverlay from '../turns-overlay/TurnsOverlay';
import {Ctx} from 'boardgame.io';
import {GameState} from '../../../../common';

interface OverlayManagerProps {
  // Explosion overlay
  explosionEvent: 'exploding' | 'defused' | null;
  explosionPlayerName: string;
  explosionIsSelf: boolean;
  onExplosionComplete: () => void;

  // Player selection overlay
  isSelectingPlayer: boolean;

  // Card giving overlay
  isChoosingCardToGive: boolean;

  // See the future overlay
  isViewingFuture: boolean;

  // Turns overlay
  turnsRemaining: number;
  isCurrentPlayer: boolean;

  // Dead overlay
  isSelfDead: boolean;
  isGameOver: boolean;

  // Winner overlay
  winnerID: string | null;
  playerID: string | null;

  // Context
  ctx: Ctx;
  G: GameState;

  // Handlers
  onCloseFutureView: () => void;
}

/**
 * Manages and renders all game overlays
 */
export default function OverlayManager({
  explosionEvent,
  explosionPlayerName,
  explosionIsSelf,
  onExplosionComplete,
  isSelectingPlayer,
  isChoosingCardToGive,
  isViewingFuture,
  turnsRemaining,
  isCurrentPlayer,
  isSelfDead,
  isGameOver,
  winnerID,
  playerID,
  ctx,
  G,
  onCloseFutureView,
}: OverlayManagerProps) {
  // Determine the overlay message based on the current stage
  let selectionMessage = "Select a player to steal a card from";
  if (isSelectingPlayer) {
    const stage = ctx.activePlayers?.[playerID || ''];
    if (stage === 'choosePlayerToRequestFrom') {
      selectionMessage = "Select a player to request a card from";
    }
  }

  // Get the top 3 cards from the draw pile for the see the future overlay
  const futureCards = isViewingFuture ? G.drawPile.slice(0, 3) : [];

  return (
    <>
      <ExplosionOverlay
        event={explosionEvent}
        playerName={explosionPlayerName}
        isSelf={explosionIsSelf}
        onComplete={onExplosionComplete}
      />
      {isSelectingPlayer && <PlayerSelectionOverlay message={selectionMessage} />}
      {isChoosingCardToGive && <PlayerSelectionOverlay message="You we're chosen to gift a card. Pick one." />}
      {isViewingFuture && (
        <SeeTheFutureOverlay cards={futureCards} onClose={onCloseFutureView} />
      )}
      <TurnsOverlay turnsRemaining={turnsRemaining} isCurrentPlayer={isCurrentPlayer} />
      {isSelfDead && !isGameOver && <DeadOverlay />}
      {isGameOver && winnerID && (
        <WinnerOverlay winnerID={winnerID} playerID={playerID} />
      )}
    </>
  );
}

