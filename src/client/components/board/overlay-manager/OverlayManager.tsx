import WinnerOverlay from '../winner-overlay/WinnerOverlay';
import DeadOverlay from '../dead-overlay/DeadOverlay';
import PlayerSelectionOverlay from '../player-selection-overlay/PlayerSelectionOverlay';
import ExplosionOverlay from '../explosion-overlay/ExplosionOverlay';

interface OverlayManagerProps {
  // Explosion overlay
  explosionEvent: 'exploding' | 'defused' | null;
  explosionPlayerName: string;
  explosionIsSelf: boolean;
  onExplosionComplete: () => void;

  // Player selection overlay
  isSelectingPlayer: boolean;

  // Dead overlay
  isSelfDead: boolean;
  isGameOver: boolean;

  // Winner overlay
  winnerID: string | null;
  playerID: string | null;
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
  isSelfDead,
  isGameOver,
  winnerID,
  playerID,
}: OverlayManagerProps) {
  return (
    <>
      <ExplosionOverlay
        event={explosionEvent}
        playerName={explosionPlayerName}
        isSelf={explosionIsSelf}
        onComplete={onExplosionComplete}
      />
      {isSelectingPlayer && <PlayerSelectionOverlay />}
      {isSelfDead && !isGameOver && <DeadOverlay />}
      {isGameOver && winnerID && (
        <WinnerOverlay winnerID={winnerID} playerID={playerID} />
      )}
    </>
  );
}

