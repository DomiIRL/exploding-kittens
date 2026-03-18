import WinnerOverlay from '../winner-overlay/WinnerOverlay';
import DeadOverlay from '../dead-overlay/DeadOverlay';
import PlayerSelectionOverlay from '../player-selection-overlay/PlayerSelectionOverlay';
import ExplosionOverlay from '../explosion-overlay/ExplosionOverlay';
import SeeTheFutureOverlay from '../see-future-overlay/SeeTheFutureOverlay';
import {
  GameContext,
  PlayerStateBundle,
  OverlayStateBundle,
  ExplosionEventBundle
} from '../../../types/component-props';

interface OverlayManagerProps {
  gameContext: GameContext;
  playerState: PlayerStateBundle;
  overlayState: OverlayStateBundle;
  explosionEvent: ExplosionEventBundle;
  winnerID: string | null;
  onCloseFutureView: () => void;
}

/**
 * Manages and renders all game overlays
 */
export default function OverlayManager({
  gameContext,
  playerState,
  overlayState,
  explosionEvent,
  winnerID,
  onCloseFutureView,
}: OverlayManagerProps) {
  const {ctx, G, playerID, matchData} = gameContext;
  const {isSelfDead} = playerState;
  const {isSelectingPlayer, isChoosingCardToGive, isViewingFuture, isGameOver} = overlayState;
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
        event={explosionEvent.event}
        playerName={explosionEvent.playerName}
        isSelf={explosionEvent.isSelf}
        onComplete={explosionEvent.onComplete}
      />
      {isSelectingPlayer && <PlayerSelectionOverlay message={selectionMessage} />}
      {isChoosingCardToGive && <PlayerSelectionOverlay message="You were chosen to gift a card. Pick one." />}
      {isViewingFuture && (
        <SeeTheFutureOverlay cards={futureCards} onClose={onCloseFutureView} />
      )}
      {isSelfDead && !isGameOver && <DeadOverlay />}
      {isGameOver && winnerID && (
        <WinnerOverlay winnerID={winnerID} playerID={playerID} matchData={matchData} />
      )}
    </>
  );
}
