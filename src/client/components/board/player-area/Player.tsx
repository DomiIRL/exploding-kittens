import './Player.css';
import PlayerCards from '../player-cards/PlayerCards';
import PlayerState from "../../../model/PlayerState";
import {Card} from "../../../../common";

interface Position {
  top: string;
  left: string;
}

interface CardPosition extends Position {
  angle: number;
}

interface PlayerAreaProps {
  playerID: string;
  playerState: PlayerState;
  cardPosition: CardPosition;
  infoPosition: Position;
  moves: any;
  isSelectable: boolean;
  isChoosingCardToGive: boolean;
  onPlayerSelect: (playerId: string) => void;
  onCardGive: (cardIndex: number) => void;
  triggerCardMovement: (card: Card | null, fromId: string, toId: string) => void;
}

export default function Player({
  playerID, 
  playerState, 
  cardPosition, 
  infoPosition, 
  moves,
  isSelectable = false,
  isChoosingCardToGive = false,
  onPlayerSelect,
  onCardGive,
  triggerCardMovement
}: PlayerAreaProps) {
  const cardRotation = cardPosition.angle - 90;

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
          triggerCardMovement={triggerCardMovement}
          playerID={playerID}
          isChoosingCardToGive={isChoosingCardToGive}
          onCardGive={onCardGive}
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
            Player Nr. {parseInt(playerID) + 1}
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

