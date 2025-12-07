import Player from '../player-area/Player';
import PlayerState from '../../../model/PlayerState';
import {calculatePlayerPositions} from '../../../utils/playerPositioning';
import {Card} from '../../../../common';

interface PlayerListProps {
  alivePlayersSorted: string[];
  allPlayers: {
    [key: string]: {
      hand: Card[];
      hand_count: number;
      isAlive: boolean;
    };
  };
  selfPlayerId: number | null;
  isSelfDead: boolean;
  isSelfSpectator: boolean;
  currentPlayer: number;
  isSelectingPlayer: boolean;
  playerID: string | null;
  moves: any;
  triggerCardMovement: (card: Card | null, fromId: string, toId: string) => void;
  onPlayerSelect: (playerId: string) => void;
}

/**
 * Renders the list of alive players positioned around the table
 */
export default function PlayerList({
  alivePlayersSorted,
  allPlayers,
  selfPlayerId,
  isSelfDead,
  isSelfSpectator,
  currentPlayer,
  isSelectingPlayer,
  playerID,
  moves,
  triggerCardMovement,
  onPlayerSelect,
}: PlayerListProps) {
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

        const playerState = new PlayerState(
          isSelfSpectator,
          selfPlayerId !== null && playerNumber === selfPlayerId,
          playerInfo.isAlive,
          playerNumber === currentPlayer,
          playerInfo.hand_count,
          playerInfo.hand
        );

        const isSelectable = isSelectingPlayer
          && player !== playerID
          && playerState.isAlive
          && playerState.handCount > 0;

        return (
          <Player
            key={player}
            playerID={player}
            playerState={playerState}
            cardPosition={cardPosition}
            infoPosition={infoPosition}
            moves={moves}
            isSelectable={isSelectable}
            onPlayerSelect={onPlayerSelect}
            triggerCardMovement={triggerCardMovement}
          />
        );
      })}
    </>
  );
}

