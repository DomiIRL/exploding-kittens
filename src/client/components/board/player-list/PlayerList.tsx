import Player from '../player-area/Player';
import PlayerState from '../../../model/PlayerState';
import {calculatePlayerPositions} from '../../../utils/playerPositioning';
import {
  GameContext,
  PlayerStateBundle,
  OverlayStateBundle,
  AnimationCallbacks,
  PlayerInteractionHandlers
} from '../../../types/component-props';
import './PlayerList.css';

interface PlayerListProps {
  alivePlayersSorted: string[];
  playerState: PlayerStateBundle;
  overlayState: OverlayStateBundle;
  isInNowCardStage: boolean;
  animationCallbacks: AnimationCallbacks;
  interactionHandlers: PlayerInteractionHandlers;
  gameContext: GameContext;
}

/**
 * Renders the list of alive players positioned around the table
 */
export default function PlayerList({
  alivePlayersSorted,
  playerState,
  overlayState,
  isInNowCardStage,
  animationCallbacks,
  interactionHandlers,
  gameContext,
}: PlayerListProps) {
  const {allPlayers, selfPlayerId, isSelfDead, isSelfSpectator, currentPlayer} = playerState;
  const {isSelectingPlayer, isChoosingCardToGive} = overlayState;
  const {playerID, moves, matchData} = gameContext;

  return (
    <div className="player-list">
      {alivePlayersSorted.map((player) => {
        const playerNumber = parseInt(player);
        const playerInfo = allPlayers[player];
        const isSelf = selfPlayerId !== null && playerNumber === selfPlayerId;

        let {cardPosition, infoPosition} = calculatePlayerPositions(
          player,
          alivePlayersSorted,
          selfPlayerId,
          isSelfDead
        );

        const playerRenderState = new PlayerState(
          isSelfSpectator,
          isSelf,
          playerInfo.isAlive,
          playerNumber === currentPlayer,
          playerInfo.client.handCount,
          playerInfo.hand
        );

        const isSelectable = isSelectingPlayer
          && player !== playerID
          && playerRenderState.isAlive
          && playerRenderState.handCount > 0;

        const isWaitingOn = gameContext.ctx.activePlayers?.[player] === 'chooseCardToGive';
        const isSelfChoosingCard = isChoosingCardToGive
          && player === playerID;

        const isSelfInNowCardStage = isInNowCardStage
          && player === playerID;

        return (
          <Player
            key={player}
            playerID={player}
            playerState={playerRenderState}
            position={{cardPosition, infoPosition}}
            isSelectable={isSelectable}
            isChoosingCardToGive={isSelfChoosingCard}
            isInNowCardStage={isSelfInNowCardStage}
            isWaitingOn={isWaitingOn}
            interactionHandlers={interactionHandlers}
            animationCallbacks={animationCallbacks}
            moves={moves}
            matchData={matchData}
          />
        );
      })}
    </div>
  );
}
