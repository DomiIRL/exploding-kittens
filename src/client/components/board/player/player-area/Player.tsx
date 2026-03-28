import './Player.css';
import PlayerCards from '../player-cards/PlayerCards.tsx';
import {getPlayerName} from "../../../../utils/matchData.ts";
import {PlayerPosition} from "../../../../types/component-props.ts";
import {useGame} from "../../../../context/GameContext.tsx";
import {Player as PlayerModel} from "../../../../../common";
import {useAnimationNode} from "../../../../context/AnimationContext.tsx";
import {
  CHOOSE_CARD_TO_GIVE,
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM
} from "../../../../../common/constants/stages.ts";

interface PlayerAreaProps {
  player: PlayerModel;
  position: PlayerPosition;
}

export default function Player({
  player,
  position,
}: PlayerAreaProps) {
  const game = useGame();
  const selfPlayer = game.selfPlayer;

  const playerId = player.id;
  const playerAnimRef = useAnimationNode(`${playerId}`);

  const isSelf = game.isSelf(playerId);
  const isTurn = player.isCurrentPlayer;
  const isSelectable =
    player.isValidCardTarget && (
    selfPlayer?.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM) ||
    selfPlayer?.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM));
  const isWaitingOn = player.isInStage(CHOOSE_CARD_TO_GIVE);

  const { cardPosition, infoPosition } = position;

  const cardRotation = cardPosition.angle - 90;
  const playerName = getPlayerName(playerId);

  const extraClasses = `${isSelf ? 'hand-interactable self' : ''} ${isTurn ? 'turn' : ''} ${isSelectable ? 'selectable' : ''} ${isWaitingOn ? 'waiting-on' : ''}`

  const handleInteract = () => {
    if (isSelectable) {
      game.selectPlayer(player);
    }
  };

  return (
    <>
      <div
        ref={playerAnimRef}
        className={`player-cards-container ${extraClasses}`}
        style={{
          position: 'absolute',
          top: cardPosition.top,
          left: cardPosition.left,
          transform: `translate(-50%, -50%) rotate(${cardRotation}deg)`,
          zIndex: isSelf ? 2 : 1,
        }}
      >
        <PlayerCards
          player={player}
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
        onClick={handleInteract}
        data-player-id={playerId}
        data-hand-count={player.handSize}
      >
        <div className="player-info flex flex-col items-center">
          <div className="player-id mt-2 font-bold">
            {playerName}
            {isSelf && ' (You)'}
          </div>
          <div className="player-hand border-2 border-black bg-white p-2 rounded">
            Cards: {player.handSize}
          </div>
        </div>
      </div>
    </>
  );
}
