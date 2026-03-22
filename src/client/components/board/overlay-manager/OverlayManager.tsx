import WinnerOverlay from '../../overlay/winner-overlay/WinnerOverlay';
import DeadOverlay from '../../overlay/dead-overlay/DeadOverlay';
import SpecialActionOverlay from '../../overlay/special-action-overlay/SpecialActionOverlay.tsx';
import SeeTheFutureOverlay from '../../overlay/see-future-overlay/SeeTheFutureOverlay';
import {useGame} from "../../../context/GameContext.tsx";
import {
  CHOOSE_CARD_TO_GIVE,
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM
} from "../../../../common/constants/stages.ts";

/**
 * Manages and renders all game overlays
 */
export default function OverlayManager() {
  const game = useGame();

  // Determine the overlay message based on the current stage
  let selectionMessage = null;
  if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM)) {
    selectionMessage = "Select a player to request a card from";
  } else if (game.selfPlayer?.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM)) {
    selectionMessage = "Select a player to steal a card from";
  }

  return (
    <>
      {selectionMessage && (
        <SpecialActionOverlay message={selectionMessage} />)
      }
      {game.selfPlayer?.isInStage(CHOOSE_CARD_TO_GIVE) && (
        <SpecialActionOverlay message="You were chosen to gift a card. Pick one." />
      )}
      <SeeTheFutureOverlay />
      <DeadOverlay />
      <WinnerOverlay/>
    </>
  );
}
