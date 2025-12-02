import './PlayerArea.css';
import PlayerCards from '../player-cards/PlayerCards';
import PlayerState from "../../../model/PlayerState";

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
}

export default function PlayerArea({ playerID, playerState, cardPosition, infoPosition }: PlayerAreaProps) {
  const cardRotation = cardPosition.angle - 90;

  return (
    <>
      <div
        className={`player-cards-container ${playerState.isSelf ? 'hand-interactable self' : ''}`}
        style={{
          position: 'absolute',
          top: cardPosition.top,
          left: cardPosition.left,
          transform: `translate(-50%, -50%) rotate(${cardRotation}deg)`,
          zIndex: playerState.isSelf ? 2 : 1,
        }}
      >
        <PlayerCards playerState={playerState} />
      </div>

      <div
        className={`player-position ${playerState.isSelf ? 'hand-interactable' : ''}`}
        style={{
          position: 'absolute',
          top: infoPosition.top,
          left: infoPosition.left,
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
        }}
      >
        <div className="player-area flex flex-col items-center">
          <div className="player-hand border-2 border-black bg-white p-2 rounded">
            Hand Cards: {playerState.handCount}
          </div>
          <div className="player-id mt-2 font-bold">
            Player {parseInt(playerID) + 1}
            {playerState.isSelf && ' (You)'}
          </div>
        </div>
      </div>
    </>
  );
}

