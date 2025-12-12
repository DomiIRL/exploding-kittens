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

interface PlayerListProps {
  alivePlayersSorted: string[];
  playerState: PlayerStateBundle;
  overlayState: OverlayStateBundle;
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
  animationCallbacks,
  interactionHandlers,
  gameContext,
}: PlayerListProps) {
  const {allPlayers, selfPlayerId, isSelfDead, isSelfSpectator, currentPlayer} = playerState;
  const {isSelectingPlayer, isChoosingCardToGive} = overlayState;
  const {playerID, moves, matchData} = gameContext;
  return (
    <>
      {alivePlayersSorted.map((player) => {
        const {cardPosition, infoPosition} = calculatePlayerPositions(
          player,
          alivePlayersSorted,
          selfPlayerId,
          isSelfDead
        );

        const playerNumber = parseInt(player);
        const playerInfo = allPlayers[player];

        const playerRenderState = new PlayerState(
          isSelfSpectator,
          selfPlayerId !== null && playerNumber === selfPlayerId,
          playerInfo.isAlive,
          playerNumber === currentPlayer,
          playerInfo.client.handCount,
          playerInfo.hand
        );

        const isSelectable = isSelectingPlayer
          && player !== playerID
          && playerRenderState.isAlive
          && playerRenderState.handCount > 0;

        const isSelfChoosingCard = isChoosingCardToGive
          && player === playerID;

        return (
          <Player
            key={player}
            playerID={player}
            playerState={playerRenderState}
            position={{cardPosition, infoPosition}}
            isSelectable={isSelectable}
            isChoosingCardToGive={isSelfChoosingCard}
            interactionHandlers={interactionHandlers}
            animationCallbacks={animationCallbacks}
            moves={moves}
            matchData={matchData}
          />
        );
      })}
    </>
  );
}

