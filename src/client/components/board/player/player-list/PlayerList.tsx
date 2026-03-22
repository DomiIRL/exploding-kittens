import Player from '../player-area/Player.tsx';
import { calculatePlayerPositions } from '../../../../utils/playerPositioning.ts';
import './PlayerList.css';
import { useGame } from '../../../../context/GameContext.tsx';

export default function PlayerList() {
  const game = useGame();
  const alivePlayers = game.players.alivePlayers;

  const selfIndex = !game.isSelfAlive
    ? null
    : alivePlayers.findIndex(p => p.id === game.selfPlayerId);

  return (
    <div className="player-list">
      {alivePlayers.map((player, playerIndex) => {

        const { cardPosition, infoPosition } = calculatePlayerPositions(
          playerIndex,
          alivePlayers.length,
          selfIndex === -1 ? null : selfIndex,
          !game.selfPlayer?.isAlive
        );

        return (
          <Player
            player={player}
            key={player.id}
            position={{ cardPosition, infoPosition }}
            matchData={game.matchData}
          />
        );
      })}
    </div>
  );
}
