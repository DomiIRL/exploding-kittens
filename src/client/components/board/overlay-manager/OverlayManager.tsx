import WinnerOverlay from '../winner-overlay/WinnerOverlay';
import DeadOverlay from '../dead-overlay/DeadOverlay';
import PlayerSelectionOverlay from '../player-selection-overlay/PlayerSelectionOverlay';
import ExplosionOverlay from '../explosion-overlay/ExplosionOverlay';
import {Ctx} from 'boardgame.io';

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

  // Dead overlay
  isSelfDead: boolean;
  isGameOver: boolean;

  // Winner overlay
  winnerID: string | null;
  playerID: string | null;

  // Context
  ctx: Ctx;
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
  isSelfDead,
  isGameOver,
  winnerID,
  playerID,
  ctx,
}: OverlayManagerProps) {
  // Determine the overlay message based on the current stage
  let selectionMessage = "Select a player to steal a card from";
  if (isSelectingPlayer) {
    const stage = ctx.activePlayers?.[playerID || ''];
    if (stage === 'choosePlayerToRequestFrom') {
      selectionMessage = "Select a player to request a card from";
    }
  }

  return (
    <>
      <ExplosionOverlay
        event={explosionEvent}
        playerName={explosionPlayerName}
        isSelf={explosionIsSelf}
        onComplete={onExplosionComplete}
      />
      {isSelectingPlayer && <PlayerSelectionOverlay message={selectionMessage} />}
      {isChoosingCardToGive && <PlayerSelectionOverlay message="Choose a card to give" />}
      {isSelfDead && !isGameOver && <DeadOverlay />}
      {isGameOver && winnerID && (
        <WinnerOverlay winnerID={winnerID} playerID={playerID} />
      )}
    </>
  );
}

