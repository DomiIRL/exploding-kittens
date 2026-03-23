import WinnerOverlay from './winner/WinnerOverlay.tsx';
import DeadOverlay from './dead/DeadOverlay.tsx';
import SpecialActionOverlay from './special-action/SpecialActionOverlay.tsx';
import SeeTheFutureOverlay from './see-future/SeeTheFutureOverlay.tsx';
import {useGame} from "../../../context/GameContext.tsx";
import {
  CHOOSE_CARD_TO_GIVE,
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM
} from "../../../../common/constants/stages.ts";
import LobbyOverlay from "./lobby/LobbyOverlay.tsx";

/**
 * Manages and renders all game overlays
 */
export default function BoardOverlays() {
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
      <LobbyOverlay />
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
