import Player from '../player-area/Player';
import PlayerState from '../../../model/PlayerState';
import {calculatePlayerPositions} from '../../../utils/playerPositioning';
import {Card, Players} from '../../../../common';

interface PlayerListProps {
  alivePlayersSorted: string[];
  allPlayers: Players,
  selfPlayerId: number | null;
  isSelfDead: boolean;
  isSelfSpectator: boolean;
  currentPlayer: number;
  isSelectingPlayer: boolean;
  isChoosingCardToGive: boolean;
  playerID: string | null;
  moves: any;
  triggerCardMovement: (card: Card | null, fromId: string, toId: string) => void;
  onPlayerSelect: (playerId: string) => void;
  onCardGive: (cardIndex: number) => void;
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
  isChoosingCardToGive,
  playerID,
  moves,
  triggerCardMovement,
  onPlayerSelect,
  onCardGive,
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
          playerInfo.client.handCount,
          playerInfo.hand
        );

        const isSelectable = isSelectingPlayer
          && player !== playerID
          && playerState.isAlive
          && playerState.handCount > 0;

        const isSelfChoosingCard = isChoosingCardToGive
          && player === playerID;

        return (
          <Player
            key={player}
            playerID={player}
            playerState={playerState}
            cardPosition={cardPosition}
            infoPosition={infoPosition}
            moves={moves}
            isSelectable={isSelectable}
            isChoosingCardToGive={isSelfChoosingCard}
            onPlayerSelect={onPlayerSelect}
            onCardGive={onCardGive}
            triggerCardMovement={triggerCardMovement}
          />
        );
      })}
    </>
  );
}

