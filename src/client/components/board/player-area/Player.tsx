import './Player.css';
import PlayerCards from '../player-cards/PlayerCards';
import PlayerState from "../../../model/PlayerState";
import {MatchPlayer, getPlayerName} from "../../../utils/matchData";
import {PlayerPosition, AnimationCallbacks, PlayerInteractionHandlers} from "../../../types/component-props";

interface PlayerAreaProps {
  playerID: string;
  playerState: PlayerState;
  position: PlayerPosition;
  moves: any;
  isSelectable: boolean;
  isChoosingCardToGive: boolean;
  interactionHandlers: PlayerInteractionHandlers;
  animationCallbacks: AnimationCallbacks;
  matchData?: MatchPlayer[];
}

export default function Player({
  playerID, 
  playerState, 
  position,
  moves,
  isSelectable = false,
  isChoosingCardToGive = false,
  interactionHandlers,
  animationCallbacks,
  matchData
}: PlayerAreaProps) {
  const {cardPosition, infoPosition} = position;
  const {onPlayerSelect} = interactionHandlers;
  const cardRotation = cardPosition.angle - 90;
  const playerName = getPlayerName(playerID, matchData);

  const extraClasses = `${playerState.isSelf ? 'hand-interactable self' : ''} ${playerState.isTurn ? 'turn' : ''} ${isSelectable ? 'selectable' : ''}`

  const handleClick = () => {
    if (isSelectable && onPlayerSelect) {
      onPlayerSelect(playerID);
    }
  };

  return (
    <>
      <div
        className={`player-cards-container ${extraClasses}`}
        style={{
          position: 'absolute',
          top: cardPosition.top,
          left: cardPosition.left,
          transform: `translate(-50%, -50%) rotate(${cardRotation}deg)`,
          zIndex: playerState.isSelf ? 2 : 1,
        }}
      >
        <PlayerCards
          playerState={playerState}
          moves={moves}
          playerID={playerID}
          isChoosingCardToGive={isChoosingCardToGive}
          animationCallbacks={animationCallbacks}
          interactionHandlers={interactionHandlers}
        />
      </div>

      <div
        className={`player-position ${extraClasses}`}
        style={{
          position: 'absolute',
          top: infoPosition.top,
          left: infoPosition.left,
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
        }}
        onClick={handleClick}
        data-player-id={playerID}
        data-hand-count={playerState.handCount}
        data-animation-id={`player-${playerID}`}
      >
        <div className="player-info flex flex-col items-center">
          <div className="player-id mt-2 font-bold">
            {playerName}
            {playerState.isSelf && ' (You)'}
          </div>
          <div className="player-hand border-2 border-black bg-white p-2 rounded">
            Cards: {playerState.handCount}
          </div>
        </div>
      </div>
    </>
  );
}

